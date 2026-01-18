import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  GATHER_SOURCES_SYSTEM_PROMPT,
  buildGatherSourcesPrompt,
} from "@/lib/ai/content-planner-prompts";
import { generateResearchItemId, ResearchItem, ResearchSource } from "@/types/content-planner";

const requestSchema = z.object({
  brief: z.object({
    coreMessage: z.string(),
    inScope: z.array(z.string()),
  }),
  audience: z.object({
    personaDescription: z.string(),
    problemsToSolve: z.array(z.string()),
  }),
  competitors: z.object({
    contentGaps: z.array(z.string()),
    uniqueAngleRecommendation: z.string(),
  }),
  primaryKeyword: z.string().optional(),
});

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Web search using Tavily API
async function performWebSearch(
  query: string
): Promise<ResearchSource[]> {
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!tavilyApiKey) {
    return []; // Gracefully return empty if no API key
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query,
        search_depth: "basic",
        max_results: 3,
        include_domains: [],
        exclude_domains: [],
      }),
    });

    if (!response.ok) {
      console.error("Tavily search failed:", await response.text());
      return [];
    }

    const data = await response.json();
    return (data.results || []).map(
      (r: { title: string; url: string; content: string }) => ({
        title: r.title || "Untitled",
        url: r.url,
        snippet: r.content?.substring(0, 300) || "",
      })
    );
  } catch (error) {
    console.error("Web search error:", error);
    return [];
  }
}

// Summarize search results for a research item
async function summarizeFindings(
  openai: OpenAI,
  researchItem: string,
  sources: ResearchSource[]
): Promise<string> {
  if (sources.length === 0) {
    return "";
  }

  const sourcesText = sources
    .map((s, i) => `Source ${i + 1}: ${s.title}\n${s.snippet}`)
    .join("\n\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a research assistant. Extract key facts, statistics, or insights from the search results that are relevant to the research question. Be concise (1-2 sentences max). Include specific numbers or quotes when available. If no relevant information is found, say "No specific data found."`,
        },
        {
          role: "user",
          content: `Research question: "${researchItem}"\n\nSearch results:\n${sourcesText}\n\nExtract the most relevant finding:`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Summarization error:", error);
    return "";
  }
}

// Process a single research item with web search
async function enrichResearchItem(
  openai: OpenAI,
  description: string,
  searchPrefix: string
): Promise<ResearchItem> {
  const searchQuery = `${searchPrefix} ${description}`;
  const sources = await performWebSearch(searchQuery);

  let summary = "";
  if (sources.length > 0) {
    summary = await summarizeFindings(openai, description, sources);
  }

  return {
    id: generateResearchItemId(),
    description,
    found: sources.length > 0 && summary.length > 0,
    aiFindings:
      sources.length > 0
        ? {
            summary: summary || "Search completed but no specific data extracted.",
            sources,
          }
        : undefined,
  };
}

// Process multiple items with rate limiting
async function enrichResearchItems(
  openai: OpenAI,
  items: string[],
  searchPrefix: string
): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];

  // Process in batches of 3 to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => enrichResearchItem(openai, item, searchPrefix))
    );
    results.push(...batchResults);

    // Small delay between batches to avoid rate limits
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const { brief, audience, competitors, primaryKeyword } = parseResult.data;
    const openai = getOpenAI();

    // Step 1: Get AI suggestions for what to research
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: GATHER_SOURCES_SYSTEM_PROMPT },
        { role: "user", content: buildGatherSourcesPrompt(brief, audience, competitors) },
      ],
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    // Extract string arrays from AI response
    const statsToFindStrings: string[] = Array.isArray(result.statsToFind)
      ? result.statsToFind.map((item: unknown) => (typeof item === "string" ? item : String(item)))
      : [];
    const expertTypesStrings: string[] = Array.isArray(result.expertTypesNeeded)
      ? result.expertTypesNeeded.map((item: unknown) => (typeof item === "string" ? item : String(item)))
      : [];
    const credibilityStrings: string[] = Array.isArray(result.credibilityBoosters)
      ? result.credibilityBoosters.map((item: unknown) => (typeof item === "string" ? item : String(item)))
      : [];
    const questionsStrings: string[] = Array.isArray(result.researchQuestions)
      ? result.researchQuestions.map((item: unknown) => (typeof item === "string" ? item : String(item)))
      : [];

    // Step 2: If TAVILY_API_KEY is available, enrich with web search
    const hasTavily = !!process.env.TAVILY_API_KEY;
    const topicContext = primaryKeyword || brief.coreMessage.split(" ").slice(0, 5).join(" ");

    let sources;

    if (hasTavily) {
      // Run all enrichment in parallel (each category separately to manage rate limits)
      const [statsToFind, expertTypesNeeded, credibilityBoosters, researchQuestions] =
        await Promise.all([
          enrichResearchItems(openai, statsToFindStrings, `${topicContext} statistics data`),
          enrichResearchItems(openai, expertTypesStrings, `${topicContext} expert`),
          enrichResearchItems(openai, credibilityStrings, `${topicContext}`),
          enrichResearchItems(openai, questionsStrings, ""),
        ]);

      sources = {
        statsToFind,
        expertTypesNeeded,
        credibilityBoosters,
        researchQuestions,
      };
    } else {
      // Fallback: just return items without AI findings
      const toResearchItems = (items: string[]): ResearchItem[] => {
        return items.map((item) => ({
          id: generateResearchItemId(),
          description: item,
          found: false,
        }));
      };

      sources = {
        statsToFind: toResearchItems(statsToFindStrings),
        expertTypesNeeded: toResearchItems(expertTypesStrings),
        credibilityBoosters: toResearchItems(credibilityStrings),
        researchQuestions: toResearchItems(questionsStrings),
      };
    }

    return NextResponse.json({ sources });
  } catch (error) {
    console.error("Error gathering sources:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a few minutes." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to gather sources. Please try again." },
      { status: 500 }
    );
  }
}
