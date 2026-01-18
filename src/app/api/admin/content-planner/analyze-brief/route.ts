import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  ANALYZE_BRIEF_SYSTEM_PROMPT,
  buildAnalyzeBriefPrompt,
} from "@/lib/ai/content-planner-prompts";

const requestSchema = z.object({
  sourceContent: z.string().min(50, "Content must be at least 50 characters"),
  workingTitle: z.string().min(1, "Working title is required"),
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

    const { sourceContent, workingTitle } = parseResult.data;

    // Call OpenAI
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ANALYZE_BRIEF_SYSTEM_PROMPT },
        { role: "user", content: buildAnalyzeBriefPrompt(sourceContent, workingTitle) },
      ],
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    // Validate and normalize the response
    const brief = {
      coreMessage: typeof result.coreMessage === "string" ? result.coreMessage : "",
      inScope: Array.isArray(result.inScope) ? result.inScope : [],
      outOfScope: Array.isArray(result.outOfScope) ? result.outOfScope : [],
      desiredOutcome: typeof result.desiredOutcome === "string" ? result.desiredOutcome : "",
      formatRecommendation: typeof result.formatRecommendation === "string" ? result.formatRecommendation : "",
    };

    return NextResponse.json({ brief });
  } catch (error) {
    console.error("Error analyzing brief:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a few minutes." },
          { status: 429 }
        );
      }
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "AI service configuration error. Please contact support." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to analyze brief. Please try again." },
      { status: 500 }
    );
  }
}
