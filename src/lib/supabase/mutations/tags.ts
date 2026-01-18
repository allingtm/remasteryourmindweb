import { createClient } from "../server";
import type { BlogTag } from "@/types";

export interface CreateTagData {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateTagData extends Partial<CreateTagData> {
  id: string;
}

export async function createTag(
  data: CreateTagData
): Promise<{ tag: BlogTag | null; error: string | null }> {
  const supabase = await createClient();

  const { data: tag, error } = await supabase
    .from("sws2026_blog_tags")
    .insert(data)
    .select()
    .single();

  if (error) {
    return { tag: null, error: error.message };
  }

  return { tag: tag as BlogTag, error: null };
}

export async function updateTag(
  data: UpdateTagData
): Promise<{ tag: BlogTag | null; error: string | null }> {
  const supabase = await createClient();
  const { id, ...updateData } = data;

  const { data: tag, error } = await supabase
    .from("sws2026_blog_tags")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { tag: null, error: error.message };
  }

  return { tag: tag as BlogTag, error: null };
}

export async function deleteTag(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // Check if tag is used by posts
  const { count } = await supabase
    .from("sws2026_blog_post_tags")
    .select("*", { count: "exact", head: true })
    .eq("tag_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: `Cannot delete tag used by ${count} posts. Please remove the tag from posts first.`,
    };
  }

  const { error } = await supabase
    .from("sws2026_blog_tags")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
