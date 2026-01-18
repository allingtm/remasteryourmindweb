import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  ANALYZE_AUDIENCE_SYSTEM_PROMPT,
  buildAnalyzeAudiencePrompt,
} from "@/lib/ai/content-planner-prompts";

const requestSchema = z.object({
  brief: z.object({
    coreMessage: z.string(),
    inScope: z.array(z.string()),
    desiredOutcome: z.string(),
  }),
  workingTitle: z.string().min(1),
  targetAudience: z.string().optional(),
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

    const { brief, workingTitle, targetAudience } = parseResult.data;

    // Call OpenAI
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ANALYZE_AUDIENCE_SYSTEM_PROMPT },
        { role: "user", content: buildAnalyzeAudiencePrompt(brief, workingTitle, targetAudience) },
      ],
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    // Validate knowledge level
    const validLevels = ["beginner", "intermediate", "expert"];
    const knowledgeLevel = validLevels.includes(result.knowledgeLevel)
      ? result.knowledgeLevel
      : "intermediate";

    // Normalize the response
    const audience = {
      personaDescription: typeof result.personaDescription === "string" ? result.personaDescription : "",
      knowledgeLevel,
      problemsToSolve: Array.isArray(result.problemsToSolve) ? result.problemsToSolve : [],
      motivations: Array.isArray(result.motivations) ? result.motivations : [],
    };

    return NextResponse.json({ audience });
  } catch (error) {
    console.error("Error analyzing audience:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a few minutes." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to analyze audience. Please try again." },
      { status: 500 }
    );
  }
}
