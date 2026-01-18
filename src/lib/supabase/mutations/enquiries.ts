import { createClient } from "../server";
import type { Enquiry } from "@/types";

export interface CreateEnquiryData {
  survey_id: string;
  post_id?: string;
  response_data: Record<string, unknown>;
  respondent_email?: string;
  respondent_name?: string;
  source_url?: string;
  user_agent?: string;
}

export async function createEnquiry(
  data: CreateEnquiryData
): Promise<{ enquiry: Enquiry | null; error: string | null }> {
  const supabase = await createClient();

  const { data: enquiry, error } = await supabase
    .from("sws2026_enquiries")
    .insert({
      ...data,
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    return { enquiry: null, error: error.message };
  }

  return { enquiry: enquiry as Enquiry, error: null };
}

export async function updateEnquiryStatus(
  id: string,
  status: Enquiry['status']
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sws2026_enquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function bulkUpdateEnquiryStatus(
  ids: string[],
  status: Enquiry['status']
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sws2026_enquiries")
    .update({ status })
    .in("id", ids);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function deleteEnquiry(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sws2026_enquiries")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function bulkDeleteEnquiries(
  ids: string[]
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sws2026_enquiries")
    .delete()
    .in("id", ids);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
