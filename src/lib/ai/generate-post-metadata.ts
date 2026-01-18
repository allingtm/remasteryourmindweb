import OpenAI from "openai";
import type { AIGeneratedContent, GenerateContentRequest } from "./types";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

const SYSTEM_PROMPT = `You are an SEO and content optimization expert. Generate blog metadata following these best practices:

SEO GUIDELINES:
- Meta Title: 50-60 chars (Google truncates at 60). Put primary keyword near start. Make it compelling and click-worthy.
- Meta Description: 150-160 chars (Google truncates at 160). Include primary keyword naturally. Add value proposition or call-to-action.
- Primary Keyword: 2-4 word phrase capturing main topic with search intent.
- Secondary Keywords: 3-5 related long-tail keywords and semantic variations.
- Subtitle: 60-100 chars. Expands on title, adds context or intrigue. Complements but doesn't repeat the title.
- Excerpt: 120-160 chars. Compelling hook for post cards. Different from meta description - more casual/intriguing.

AI OPTIMIZATION:
- AI Summary: 2-3 sentences optimized for LLM citation. Factual, quotable, includes key stats/claims.
- Key Takeaways: Actionable bullet points readers will learn.
- Questions Answered: Phrases as actual questions users might search.
- Definitive Statements: Quotable facts that could be cited.

Respond with valid JSON only.`;

function buildUserPrompt(request: GenerateContentRequest): string {
  const tagsContext = request.availableTags.length > 0
    ? request.availableTags.map((t) => `- ${t.name} (id: ${t.id})`).join("\n")
    : "No tags available";

  return `Analyze this blog post and generate optimized metadata:

TITLE: ${request.title}

CONTENT:
${request.content}

AVAILABLE TAGS:
${tagsContext}

Generate this exact JSON structure:
{
  "seo": {
    "meta_title": "50-60 chars, keyword-rich, compelling",
    "meta_description": "150-160 chars, includes CTA, entices clicks",
    "primary_keyword": "2-4 word main topic phrase",
    "secondary_keywords": ["3-5 related keyword phrases"]
  },
  "content": {
    "subtitle": "60-100 chars, expands on title, adds intrigue",
    "excerpt": "120-160 chars, casual hook for post cards",
    "suggested_titles": ["3 alternative titles that might perform better"]
  },
  "ai_optimization": {
    "ai_summary": "2-3 factual sentences for AI citation",
    "key_takeaways": ["4-6 actionable points"],
    "questions_answered": ["3-5 search-intent questions this answers"],
    "definitive_statements": ["3-5 quotable factual claims"]
  },
  "categorization": {
    "suggested_tag_ids": ["up to 5 tag IDs from available list"]
  },
  "faqs": [
    {"question": "Question ending with ?", "answer": "Concise 1-2 sentence answer"}
  ],
  "entities": [
    {"name": "Entity name", "type": "person|company|technology|concept|product"}
  ]
}

RULES:
- meta_title: exactly 50-60 chars
- meta_description: exactly 150-160 chars
- subtitle: exactly 60-100 chars
- excerpt: exactly 120-160 chars
- Only use tag IDs from AVAILABLE TAGS list (use empty array if none match)
- Generate 3-5 FAQs
- Respond with ONLY valid JSON`;
}

export async function generatePostMetadata(
  request: GenerateContentRequest
): Promise<AIGeneratedContent> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
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

  const parsed = JSON.parse(content) as AIGeneratedContent;

  // Enforce character limits
  if (parsed.seo.meta_title.length > 60) {
    parsed.seo.meta_title = parsed.seo.meta_title.slice(0, 57) + "...";
  }
  if (parsed.seo.meta_description.length > 160) {
    parsed.seo.meta_description = parsed.seo.meta_description.slice(0, 157) + "...";
  }

  // Validate tag IDs
  const validTagIds = new Set(request.availableTags.map((t) => t.id));
  parsed.categorization.suggested_tag_ids = parsed.categorization.suggested_tag_ids.filter(
    (id) => validTagIds.has(id)
  );

  return parsed;
}
