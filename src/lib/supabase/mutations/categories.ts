import { createClient } from "../server";
import type { BlogCategory } from "@/types";

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  subtitle?: string;
  meta_title?: string;
  meta_description?: string;
  color?: string;
  icon?: string;
  display_order?: number;
  show_in_nav?: boolean;
  show_on_homepage?: boolean;
  parent_id?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

export async function createCategory(
  data: CreateCategoryData
): Promise<{ category: BlogCategory | null; error: string | null }> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("sws2026_blog_categories")
    .insert(data)
    .select()
    .single();

  if (error) {
    return { category: null, error: error.message };
  }

  return { category: category as BlogCategory, error: null };
}

export async function updateCategory(
  data: UpdateCategoryData
): Promise<{ category: BlogCategory | null; error: string | null }> {
  const supabase = await createClient();
  const { id, ...updateData } = data;

  const { data: category, error } = await supabase
    .from("sws2026_blog_categories")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { category: null, error: error.message };
  }

  return { category: category as BlogCategory, error: null };
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // Check if category has posts
  const { count } = await supabase
    .from("sws2026_blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: `Cannot delete category with ${count} posts. Please reassign or delete the posts first.`,
    };
  }

  const { error } = await supabase
    .from("sws2026_blog_categories")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
