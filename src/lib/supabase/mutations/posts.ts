import { createClient } from "../server";
import type { BlogPost, BlogFaq } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreatePostData {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  featured_image_alt?: string;
  og_image?: string;
  author_id: string;
  category_id: string;
  status: "draft" | "scheduled" | "published" | "archived";
  published_at?: string;
  scheduled_for?: string;
  is_featured?: boolean;
  featured_order?: number;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  primary_keyword?: string;
  secondary_keywords?: string[];
  ai_summary?: string;
  key_takeaways?: string[];
  definitive_statements?: string[];
  questions_answered?: string[];
  entities?: object[];
  topic_cluster?: string;
  content_type?: string;
  expertise_level?: string;
  sources?: object[];
  read_time_minutes?: number;
  word_count?: number;
  // Enquiry & Calendly fields
  survey_id?: string | null;
  enquiry_cta_title?: string | null;
  calendly_enabled?: boolean;
  calendly_event_type_uri?: string | null;
  calendly_scheduling_url?: string | null;
  calendly_cta_title?: string | null;
  calendly_cta_description?: string | null;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

export async function createPost(
  data: CreatePostData,
  supabaseClient?: SupabaseClient
): Promise<{ post: BlogPost | null; error: string | null }> {
  const supabase = supabaseClient || await createClient();

  // Calculate word count and read time if content provided
  if (data.content && !data.word_count) {
    const words = data.content.trim().split(/\s+/).length;
    data.word_count = words;
    data.read_time_minutes = Math.ceil(words / 200);
  }

  // Set published_at if publishing
  if (data.status === "published" && !data.published_at) {
    data.published_at = new Date().toISOString();
  }

  const { data: post, error } = await supabase
    .from("sws2026_blog_posts")
    .insert(data)
    .select()
    .single();

  if (error) {
    return { post: null, error: error.message };
  }

  return { post: post as BlogPost, error: null };
}

export async function updatePost(
  data: UpdatePostData,
  supabaseClient?: SupabaseClient
): Promise<{ post: BlogPost | null; error: string | null }> {
  const supabase = supabaseClient || await createClient();
  const { id, ...updateData } = data;

  // Calculate word count and read time if content provided
  if (updateData.content && !updateData.word_count) {
    const words = updateData.content.trim().split(/\s+/).length;
    updateData.word_count = words;
    updateData.read_time_minutes = Math.ceil(words / 200);
  }

  // Set published_at if publishing for the first time
  if (updateData.status === "published" && !updateData.published_at) {
    // Check if already has a published_at date
    const { data: existing } = await supabase
      .from("sws2026_blog_posts")
      .select("published_at")
      .eq("id", id)
      .single();

    if (!existing?.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data: post, error } = await supabase
    .from("sws2026_blog_posts")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { post: null, error: error.message };
  }

  return { post: post as BlogPost, error: null };
}

export async function deletePost(
  id: string,
  supabaseClient?: SupabaseClient
): Promise<{ success: boolean; error: string | null }> {
  const supabase = supabaseClient || await createClient();

  const { error } = await supabase
    .from("sws2026_blog_posts")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function updatePostTags(
  postId: string,
  tagIds: string[]
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // Delete existing tags
  const { error: deleteError } = await supabase
    .from("sws2026_blog_post_tags")
    .delete()
    .eq("post_id", postId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  // Insert new tags
  if (tagIds.length > 0) {
    const tagInserts = tagIds.map((tagId) => ({
      post_id: postId,
      tag_id: tagId,
    }));

    const { error: insertError } = await supabase
      .from("sws2026_blog_post_tags")
      .insert(tagInserts);

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  return { success: true, error: null };
}

export async function createFaq(
  postId: string,
  question: string,
  answer: string,
  displayOrder: number = 0
): Promise<{ faq: BlogFaq | null; error: string | null }> {
  const supabase = await createClient();

  const { data: faq, error } = await supabase
    .from("sws2026_blog_faqs")
    .insert({
      post_id: postId,
      question,
      answer,
      display_order: displayOrder,
    })
    .select()
    .single();

  if (error) {
    return { faq: null, error: error.message };
  }

  return { faq: faq as BlogFaq, error: null };
}

export async function updateFaq(
  id: string,
  question: string,
  answer: string,
  displayOrder?: number
): Promise<{ faq: BlogFaq | null; error: string | null }> {
  const supabase = await createClient();

  const updateData: { question: string; answer: string; display_order?: number } = {
    question,
    answer,
  };

  if (displayOrder !== undefined) {
    updateData.display_order = displayOrder;
  }

  const { data: faq, error } = await supabase
    .from("sws2026_blog_faqs")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { faq: null, error: error.message };
  }

  return { faq: faq as BlogFaq, error: null };
}

export async function deleteFaq(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sws2026_blog_faqs")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function updatePostFaqs(
  postId: string,
  faqs: { id?: string; question: string; answer: string }[]
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // Get existing FAQs
  const { data: existingFaqs } = await supabase
    .from("sws2026_blog_faqs")
    .select("id")
    .eq("post_id", postId);

  const existingIds = new Set((existingFaqs || []).map((f) => f.id));
  const newIds = new Set(faqs.filter((f) => f.id).map((f) => f.id));

  // Delete removed FAQs
  const toDelete = [...existingIds].filter((id) => !newIds.has(id));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("sws2026_blog_faqs")
      .delete()
      .in("id", toDelete);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }
  }

  // Update or insert FAQs
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    if (faq.id) {
      // Update existing
      const { error } = await supabase
        .from("sws2026_blog_faqs")
        .update({
          question: faq.question,
          answer: faq.answer,
          display_order: i,
        })
        .eq("id", faq.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Insert new
      const { error } = await supabase.from("sws2026_blog_faqs").insert({
        post_id: postId,
        question: faq.question,
        answer: faq.answer,
        display_order: i,
      });

      if (error) {
        return { success: false, error: error.message };
      }
    }
  }

  return { success: true, error: null };
}
