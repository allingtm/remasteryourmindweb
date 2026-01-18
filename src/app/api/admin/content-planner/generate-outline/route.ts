import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  GENERATE_OUTLINE_SYSTEM_PROMPT,
  buildGenerateOutlinePrompt,
} from "@/lib/ai/content-planner-prompts";

// Schema for research items with optional AI findings
const researchItemSchema = z.object({
  description: z.string(),
  aiSummary: z.string().optional(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })).optional(),
});

const requestSchema = z.object({
  workingTitle: z.string().min(1),
  brief: z.object({
    coreMessage: z.string(),
    inScope: z.array(z.string()),
    formatRecommendation: z.string(),
  }),
  keywords: z.object({
    primaryKeyword: z.string(),
    searchIntent: z.string(),
  }),
  audience: z.object({
    personaDescription: z.string(),
    knowledgeLevel: z.string(),
    problemsToSolve: z.array(z.string()),
  }),
  competitors: z.object({
    uniqueAngleRecommendation: z.string(),
    workingPatterns: z.array(z.string()),
  }),
  sources: z.object({
    statsToFind: z.array(researchItemSchema),
    researchQuestions: z.array(researchItemSchema),
    expertTypesNeeded: z.array(researchItemSchema).optional(),
    credibilityBoosters: z.array(researchItemSchema).optional(),
  }),
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

    const { workingTitle, brief, keywords, audience, competitors, sources } = parseResult.data;

    // Pass sources directly - prompt builder now handles AI findings
    const sourcesForPrompt = {
      statsToFind: sources.statsToFind,
      researchQuestions: sources.researchQuestions,
      expertTypesNeeded: sources.expertTypesNeeded,
      credibilityBoosters: sources.credibilityBoosters,
    };

    // Call OpenAI
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: GENERATE_OUTLINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildGenerateOutlinePrompt(
            workingTitle,
            brief,
            keywords,
            audience,
            competitors,
            sourcesForPrompt
          ),
        },
      ],
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    // Normalize the sections
    const sections = Array.isArray(result.sections)
      ? result.sections.map(
          (
            section: {
              heading?: string;
              purpose?: string;
              keyPoints?: string[];
              evidencePlacement?: string;
              suggestedWordCount?: number;
            },
            index: number
          ) => ({
            id: `section-${Date.now()}-${index}`,
            heading: typeof section.heading === "string" ? section.heading : `Section ${index + 1}`,
            purpose: typeof section.purpose === "string" ? section.purpose : "",
            keyPoints: Array.isArray(section.keyPoints) ? section.keyPoints : [],
            evidencePlacement:
              typeof section.evidencePlacement === "string" ? section.evidencePlacement : "",
            suggestedWordCount:
              typeof section.suggestedWordCount === "number" ? section.suggestedWordCount : 300,
          })
        )
      : [];

    // Calculate total word count
    const totalWordCount =
      typeof result.totalWordCount === "number"
        ? result.totalWordCount
        : sections.reduce(
            (sum: number, s: { suggestedWordCount: number }) => sum + s.suggestedWordCount,
            0
          );

    const outline = {
      sections,
      totalWordCount,
    };

    return NextResponse.json({ outline });
  } catch (error) {
    console.error("Error generating outline:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a few minutes." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate outline. Please try again." },
      { status: 500 }
    );
  }
}
