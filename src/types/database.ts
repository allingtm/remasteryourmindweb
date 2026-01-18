// Database types for blog system

export interface BlogAuthor {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: Record<string, string>;
  expertise: string[] | null;
  is_active: boolean;
  can_export: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  subtitle: string | null;
  meta_title: string | null;
  meta_description: string | null;
  color: string | null;
  icon: string | null;
  display_order: number;
  show_in_nav: boolean;
  show_on_homepage: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  og_image: string | null;
  author_id: string;
  category_id: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at: string | null;
  scheduled_for: string | null;
  is_featured: boolean;
  featured_order: number | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  ai_summary: string | null;
  key_takeaways: string[] | null;
  definitive_statements: string[] | null;
  questions_answered: string[] | null;
  entities: Array<{ name: string; type: string; url?: string }>;
  topic_cluster: string | null;
  content_type: string | null;
  expertise_level: string | null;
  last_verified_at: string | null;
  sources: Array<{ title: string; url: string }>;
  read_time_minutes: number | null;
  word_count: number | null;
  view_count: number;
  survey_id: string | null;
  enquiry_cta_title: string | null;
  // Calendly fields
  calendly_enabled: boolean;
  calendly_event_type_uri: string | null;
  calendly_scheduling_url: string | null;
  calendly_cta_title: string | null;
  calendly_cta_description: string | null;
  // Lead article flag
  is_lead_article: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPostWithRelations extends BlogPost {
  author: BlogAuthor;
  category: BlogCategory;
  tags: BlogTag[];
  faqs: BlogFaq[];
  survey: Survey | null;
}

export interface BlogFaq {
  id: string;
  post_id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

export interface BlogRelatedPost {
  post_id: string;
  related_post_id: string;
  relevance_score: number;
  is_manual: boolean;
}

export interface BlogSetting {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  storage_path: string;
  public_url: string;
  file_type: 'image' | 'video' | 'audio';
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  alt_text: string | null;
  caption: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// Survey types for enquiry forms
export interface Survey {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  json_definition: Record<string, unknown>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  survey_id: string;
  post_id: string | null;
  response_data: Record<string, unknown>;
  respondent_email: string | null;
  respondent_name: string | null;
  status: 'new' | 'read' | 'archived';
  source_url: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface EnquiryWithRelations extends Enquiry {
  survey: Survey;
  post: BlogPost | null;
}

// Help Options for lead capture helper on homepage
export interface HelpOption {
  id: string;
  text: string;
  description: string | null;
  post_id: string;
  display_order: number;
  is_active: boolean;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface HelpOptionWithPost extends HelpOption {
  post: Pick<BlogPost, 'id' | 'slug' | 'title'>;
}

// Re-export content planner types
export type {
  ContentPlannerInput,
  BriefAnalysis,
  KeywordResearch,
  AudienceAnalysis,
  CompetitiveAnalysis,
  SourcesResearch,
  HelpSheetOutline,
  AuthorHelpSheet,
} from './content-planner';
