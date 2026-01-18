// Types for AI-generated blog post content

export interface AIGeneratedContent {
  seo: {
    meta_title: string;
    meta_description: string;
    primary_keyword: string;
    secondary_keywords: string[];
  };
  content: {
    subtitle: string;
    excerpt: string;
    suggested_titles: string[];
  };
  ai_optimization: {
    ai_summary: string;
    key_takeaways: string[];
    questions_answered: string[];
    definitive_statements: string[];
  };
  categorization: {
    suggested_tag_ids: string[];
  };
  faqs: Array<{ question: string; answer: string }>;
  entities: Array<{ name: string; type: string }>;
  og_image?: {
    url: string;
    prompt: string;
  };
}

export interface GenerateContentRequest {
  title: string;
  content: string;
  availableTags: Array<{ id: string; name: string }>;
  generateImage?: boolean;
}

export interface GenerateImageRequest {
  title: string;
  excerpt: string;
}

// Types for AI-generated category content

export interface AICategoryContent {
  subtitle: string;
  description: string;
  meta_title: string;
  meta_description: string;
}

export interface GenerateCategoryRequest {
  name: string;
  prompt?: string;
}

// Types for per-field AI suggestions

export type SuggestableFieldName =
  | "title"
  | "subtitle"
  | "excerpt"
  | "meta_title"
  | "meta_description"
  | "primary_keyword"
  | "secondary_keywords"
  | "ai_summary"
  | "key_takeaways"
  | "questions_answered"
  | "definitive_statements";

export interface FieldConfig {
  name: SuggestableFieldName;
  label: string;
  description: string;
  minLength?: number;
  maxLength?: number;
  isMultiline?: boolean;
  isList?: boolean;
  listDelimiter?: string;
  placeholder?: string;
  suggestionCount: number;
}

export interface SuggestionHistoryItem {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface FieldSuggestionRequest {
  fieldName: SuggestableFieldName;
  fieldConfig: FieldConfig;
  currentValue: string;
  blogTitle: string;
  blogContent: string;
  userPrompt?: string;
  history: SuggestionHistoryItem[];
  suggestionCount: number;
}

export interface FieldSuggestion {
  value: string;
  reasoning?: string;
}

export interface FieldSuggestionResponse {
  suggestions: FieldSuggestion[];
  fieldName: SuggestableFieldName;
}
