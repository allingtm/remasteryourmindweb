import type { FieldConfig, SuggestableFieldName } from "./types";

export const FIELD_CONFIGS: Record<SuggestableFieldName, FieldConfig> = {
  title: {
    name: "title",
    label: "Title",
    description:
      "The main headline of the blog post. Should be compelling, SEO-friendly, and capture the essence of the content.",
    minLength: 20,
    maxLength: 100,
    isMultiline: false,
    suggestionCount: 5,
  },
  subtitle: {
    name: "subtitle",
    label: "Subtitle",
    description:
      "A supporting line that expands on the title. Adds context or intrigue without repeating the title.",
    minLength: 60,
    maxLength: 100,
    isMultiline: false,
    suggestionCount: 5,
  },
  excerpt: {
    name: "excerpt",
    label: "Excerpt",
    description:
      "Brief description shown on post cards. Should be engaging and entice clicks. More casual than meta description.",
    minLength: 120,
    maxLength: 160,
    isMultiline: true,
    suggestionCount: 5,
  },
  meta_title: {
    name: "meta_title",
    label: "Meta Title",
    description:
      "SEO title shown in search results. Put primary keyword near the start. Make it click-worthy.",
    minLength: 50,
    maxLength: 60,
    isMultiline: false,
    suggestionCount: 5,
  },
  meta_description: {
    name: "meta_description",
    label: "Meta Description",
    description:
      "SEO description shown in search results. Include the primary keyword naturally. Add a value proposition or call-to-action.",
    minLength: 150,
    maxLength: 160,
    isMultiline: true,
    suggestionCount: 5,
  },
  primary_keyword: {
    name: "primary_keyword",
    label: "Primary Keyword",
    description:
      "The main keyword phrase (2-4 words) capturing the topic with search intent. This is what users would search for.",
    minLength: 5,
    maxLength: 50,
    isMultiline: false,
    suggestionCount: 5,
  },
  secondary_keywords: {
    name: "secondary_keywords",
    label: "Secondary Keywords",
    description:
      "Related long-tail keywords and semantic variations. These support the primary keyword and capture related searches.",
    isMultiline: false,
    isList: true,
    listDelimiter: ", ",
    suggestionCount: 5,
  },
  ai_summary: {
    name: "ai_summary",
    label: "AI Summary",
    description:
      "2-3 factual sentences optimized for LLM citation. Include key stats, claims, or conclusions. Make it quotable.",
    minLength: 100,
    maxLength: 400,
    isMultiline: true,
    suggestionCount: 5,
  },
  key_takeaways: {
    name: "key_takeaways",
    label: "Key Takeaways",
    description:
      "Actionable bullet points readers will learn from this post. Each should be a complete, standalone insight.",
    isMultiline: true,
    isList: true,
    listDelimiter: "\n",
    suggestionCount: 5,
  },
  questions_answered: {
    name: "questions_answered",
    label: "Questions Answered",
    description:
      "Questions users might search that this article answers. Phrase as actual questions ending with ?",
    isMultiline: true,
    isList: true,
    listDelimiter: "\n",
    suggestionCount: 5,
  },
  definitive_statements: {
    name: "definitive_statements",
    label: "Definitive Statements",
    description:
      "Quotable facts from your content that could be cited. These should be authoritative, specific, and verifiable.",
    isMultiline: true,
    isList: true,
    listDelimiter: "\n",
    suggestionCount: 5,
  },
};

export function getFieldConfig(fieldName: SuggestableFieldName): FieldConfig {
  return FIELD_CONFIGS[fieldName];
}
