import { createClient } from "../server";
import type { Survey } from "@/types";

export interface CreateSurveyData {
  name: string;
  slug: string;
  description?: string;
  json_definition: Record<string, unknown>;
  status?: 'active' | 'inactive';
}

export interface UpdateSurveyData extends Partial<CreateSurveyData> {
  id: string;
}

export async function createSurvey(
  data: CreateSurveyData
): Promise<{ survey: Survey | null; error: string | null }> {
  const supabase = await createClient();

  const { data: survey, error } = await supabase
    .from("sws2026_surveys")
    .insert({
      ...data,
      status: data.status || 'active',
    })
    .select()
    .single();

  if (error) {
    return { survey: null, error: error.message };
  }

  return { survey: survey as Survey, error: null };
}

export async function updateSurvey(
  data: UpdateSurveyData
): Promise<{ survey: Survey | null; error: string | null }> {
  const supabase = await createClient();
  const { id, ...updateData } = data;

  const { data: survey, error } = await supabase
    .from("sws2026_surveys")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { survey: null, error: error.message };
  }

  return { survey: survey as Survey, error: null };
}

export async function deleteSurvey(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // Check if survey is used by any posts
  const { count: postCount } = await supabase
    .from("sws2026_blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("survey_id", id);

  if (postCount && postCount > 0) {
    return {
      success: false,
      error: `Cannot delete survey used by ${postCount} posts. Please remove the survey from those posts first.`,
    };
  }

  // Check if survey has enquiries
  const { count: enquiryCount } = await supabase
    .from("sws2026_enquiries")
    .select("*", { count: "exact", head: true })
    .eq("survey_id", id);

  if (enquiryCount && enquiryCount > 0) {
    return {
      success: false,
      error: `Cannot delete survey with ${enquiryCount} enquiries. Please delete the enquiries first or archive the survey instead.`,
    };
  }

  const { error } = await supabase
    .from("sws2026_surveys")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
