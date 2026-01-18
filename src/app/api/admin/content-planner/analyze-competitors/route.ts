import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  ANALYZE_COMPETITORS_SYSTEM_PROMPT,
  buildAnalyzeCompetitorsPrompt,
} from "@/lib/ai/content-planner-prompts";

const requestSchema = z.object({
  brief: z.object({
    coreMessage: z.string(),
    inScope: z.array(z.string()),
  }),
  keywords: z.object({
    primaryKeyword: z.string(),
    secondaryKeywords: z.array(z.string()),
  }),
  customUrls: z.array(z.string()).optional(),
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

// Web search using Tavily API - requires TAVILY_API_KEY
async function performWebSearch(
  query: string
): Promise<{ title: string; url: string; snippet: string }[]> {
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!tavilyApiKey) {
    throw new Error("Web search is not configured. Please set TAVILY_API_KEY environment variable.");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: tavilyApiKey,
      query,
      search_depth: "basic",
      max_results: 8,
      include_domains: [],
      exclude_domains: [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Tavily search failed:", errorText);
    throw new Error("Web search failed. Please try again.");
  }

  const data = await response.json();
  return (data.results || []).map(
    (r: { title: string; url: string; content: string }) => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.substring(0, 200) || "",
    })
  );
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

    const { brief, keywords, customUrls } = parseResult.data;

    // Perform web search
    const searchQuery = `${keywords.primaryKeyword} guide article`;
    const searchResults = await performWebSearch(searchQuery);

    // Add custom URLs to search results if provided
    if (customUrls && customUrls.length > 0) {
      for (const url of customUrls) {
        // Check if URL is not already in search results
        if (!searchResults.some(r => r.url === url)) {
          searchResults.push({
            title: `Custom: ${new URL(url).hostname}`,
            url,
            snippet: "User-provided competitor URL for analysis",
          });
        }
      }
    }

    // Call OpenAI to analyze the results
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ANALYZE_COMPETITORS_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildAnalyzeCompetitorsPrompt(brief, keywords, searchResults),
        },
      ],
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    // Normalize the response
    const competitors = {
      searchResults,
      commonAngles: Array.isArray(result.commonAngles) ? result.commonAngles : [],
      contentGaps: Array.isArray(result.contentGaps) ? result.contentGaps : [],
      workingPatterns: Array.isArray(result.workingPatterns) ? result.workingPatterns : [],
      uniqueAngleRecommendation:
        typeof result.uniqueAngleRecommendation === "string"
          ? result.uniqueAngleRecommendation
          : "",
    };

    return NextResponse.json({ competitors });
  } catch (error) {
    console.error("Error analyzing competitors:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a few minutes." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to analyze competitors. Please try again." },
      { status: 500 }
    );
  }
}
