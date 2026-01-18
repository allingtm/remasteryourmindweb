import OpenAI from "openai";
import type { AICategoryContent, GenerateCategoryRequest } from "./types";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

const SYSTEM_PROMPT = `You are a copywriter for a software development company's blog. Write category metadata that sounds human, warm, and approachable - not corporate or robotic.

CATEGORY PAGE SEO GUIDELINES:
- Meta Title: 50-60 chars. Include category name near start. Make it descriptive and search-friendly.
- Meta Description: 150-160 chars. Describe what readers will find. Sound helpful, not salesy.
- Subtitle: 60-100 chars. A natural tagline that adds context. Should flow like something a person would say.
- Description: 150-300 chars. Explain what this category covers in plain, conversational language.

TONE GUIDELINES:
- Write like you're explaining to a friend, not pitching to a boardroom
- Be confident but not boastful - show expertise through substance, not claims
- Avoid corporate buzzwords: "leverage", "cutting-edge", "innovative solutions", "transform your business"
- Avoid stiff phrases: "Explore our...", "Designed for...", "showcasing our expertise", "business decision-makers"
- Don't start descriptions with "Explore" or "Discover"
- Use natural language: "We build...", "Here's how...", "From X to Y..."
- Be specific rather than generic - concrete examples beat vague promises

BUSINESS CONTEXT:
- We're a software house that builds custom software for businesses
- We write about what we know from actually building things
- Articles share real insights, approaches, and solutions - not tutorials
- The reader is probably researching whether to hire developers or how software could help their business

Respond with valid JSON only.`;

function buildUserPrompt(request: GenerateCategoryRequest): string {
  const promptContext = request.prompt
    ? `\n\nADDITIONAL CONTEXT FROM USER:\n${request.prompt}`
    : "";

  return `Generate optimized metadata for this blog category:

CATEGORY NAME: ${request.name}
${promptContext}

Generate this exact JSON structure:
{
  "subtitle": "60-100 chars, compelling tagline that expands on category name",
  "description": "150-300 chars, explains category scope and what readers will find",
  "meta_title": "50-60 chars, SEO-optimized title including category name",
  "meta_description": "150-160 chars, describes category content with value proposition"
}

RULES:
- subtitle: exactly 60-100 chars
- description: exactly 150-300 chars
- meta_title: exactly 50-60 chars
- meta_description: exactly 150-160 chars
- Sound like a human wrote it, not a marketing department
- No corporate jargon or stiff phrasing
- Respond with ONLY valid JSON`;
}

export async function generateCategoryMetadata(
  request: GenerateCategoryRequest
): Promise<AICategoryContent> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-latest",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(request) },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content) as AICategoryContent;

  // Enforce character limits
  if (parsed.meta_title.length > 60) {
    parsed.meta_title = parsed.meta_title.slice(0, 57) + "...";
  }
  if (parsed.meta_description.length > 160) {
    parsed.meta_description = parsed.meta_description.slice(0, 157) + "...";
  }

  return parsed;
}
