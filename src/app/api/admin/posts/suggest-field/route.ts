import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import OpenAI from "openai";
import type {
  FieldSuggestionRequest,
  FieldSuggestionResponse,
  FieldSuggestion,
  FieldConfig,
} from "@/lib/ai/types";

const historyItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
});

const fieldConfigSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  isMultiline: z.boolean().optional(),
  isList: z.boolean().optional(),
  listDelimiter: z.string().optional(),
  placeholder: z.string().optional(),
  suggestionCount: z.number(),
});

const requestSchema = z.object({
  fieldName: z.string(),
  fieldConfig: fieldConfigSchema,
  currentValue: z.string(),
  blogTitle: z.string().min(1, "Blog title is required"),
  blogContent: z.string().min(50, "Blog content must be at least 50 characters"),
  userPrompt: z.string().optional(),
  history: z.array(historyItemSchema),
  suggestionCount: z.number().min(1).max(10).default(5),
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

function buildSystemPrompt(config: FieldConfig): string {
  const constraints: string[] = [];

  if (config.minLength && config.maxLength) {
    constraints.push(`Length: ${config.minLength}-${config.maxLength} characters`);
  } else if (config.maxLength) {
    constraints.push(`Maximum length: ${config.maxLength} characters`);
  } else if (config.minLength) {
    constraints.push(`Minimum length: ${config.minLength} characters`);
  }

  if (config.isList) {
    const delimiter = config.listDelimiter === "\n" ? "newlines" : `"${config.listDelimiter}"`;
    constraints.push(`This is a list field. Provide multiple items separated by ${delimiter}`);
  }

  return `You are an expert SEO and content optimization assistant for a software development company blog. Generate high-quality suggestions for the "${config.label}" field.

FIELD DESCRIPTION:
${config.description}

${constraints.length > 0 ? `CONSTRAINTS:\n${constraints.join("\n")}` : ""}

GUIDELINES:
- Generate diverse, high-quality alternatives with different approaches/angles
- Each suggestion must be unique and meaningfully different
- Strictly respect any character limits - this is critical for SEO
- Consider SEO best practices and search intent
- Make suggestions compelling, specific, and engaging
- Avoid generic or corporate-sounding language
- For list fields, provide complete lists with 4-6 items each
- Include brief reasoning explaining what makes each suggestion effective

Respond with valid JSON only:
{
  "suggestions": [
    { "value": "the suggestion text", "reasoning": "why this works" }
  ]
}`;
}

function buildUserPrompt(request: FieldSuggestionRequest): string {
  const parts: string[] = [];

  parts.push(`BLOG TITLE: ${request.blogTitle}`);
  parts.push("");
  parts.push(`BLOG CONTENT (first 3000 chars):\n${request.blogContent.slice(0, 3000)}`);
  parts.push("");

  if (request.currentValue) {
    parts.push(`CURRENT VALUE: ${request.currentValue}`);
    parts.push("");
  }

  // Include previous suggestions to avoid repetition
  const previousSuggestions = request.history
    .filter((h) => h.role === "assistant")
    .map((h) => h.content)
    .join("\n---\n");

  if (previousSuggestions) {
    parts.push("PREVIOUS SUGGESTIONS (do NOT repeat these - generate fresh alternatives):");
    parts.push(previousSuggestions);
    parts.push("");
  }

  // Include user's custom prompt if provided
  if (request.userPrompt) {
    parts.push(`USER INSTRUCTIONS: ${request.userPrompt}`);
    parts.push("");
  }

  parts.push(
    `Generate exactly ${request.suggestionCount} unique suggestions for the "${request.fieldConfig.label}" field.`
  );

  if (previousSuggestions) {
    parts.push(
      "\nIMPORTANT: You MUST generate completely NEW suggestions different from all previous ones shown above."
    );
  }

  return parts.join("\n");
}

export async function POST(req: NextRequest) {
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
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const request = parseResult.data as FieldSuggestionRequest;

    // Generate suggestions
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-latest",
      messages: [
        { role: "system", content: buildSystemPrompt(request.fieldConfig) },
        { role: "user", content: buildUserPrompt(request) },
      ],
      temperature: 0.8, // Higher temperature for more variety
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content) as { suggestions: FieldSuggestion[] };

    // Validate and enforce character limits
    const config = request.fieldConfig;
    const validatedSuggestions = parsed.suggestions.map((s) => {
      let value = s.value;

      // Enforce max length
      if (config.maxLength && value.length > config.maxLength) {
        // Truncate intelligently at word boundary
        value = value.slice(0, config.maxLength - 3);
        const lastSpace = value.lastIndexOf(" ");
        if (lastSpace > config.maxLength * 0.7) {
          value = value.slice(0, lastSpace);
        }
        value += "...";
      }

      return {
        value,
        reasoning: s.reasoning,
      };
    });

    const responseData: FieldSuggestionResponse = {
      suggestions: validatedSuggestions,
      fieldName: request.fieldName,
    };

    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Error generating field suggestions:", error);

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
      { error: "Failed to generate suggestions. Please try again." },
      { status: 500 }
    );
  }
}
