import { createClient } from "../server";
import type { CalendlyBooking } from "@/types/calendly";

export interface CreateCalendlyBookingData {
  post_id?: string;
  calendly_event_uri?: string;
  event_type_uri: string;
  event_start_time: string;
  invitee_name: string;
  invitee_email: string;
  invitee_phone?: string;
  invitee_company?: string;
  invitee_message?: string;
  source_url?: string;
}

export async function createCalendlyBooking(
  data: CreateCalendlyBookingData
): Promise<{ booking: CalendlyBooking | null; error: string | null }> {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("sws2026_calendly_bookings")
    .insert({
      ...data,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { booking: null, error: error.message };
  }

  return { booking: booking as CalendlyBooking, error: null };
}

export async function updateCalendlyBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled" | "completed"
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sws2026_calendly_bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function updateCalendlyBookingByEventUri(
  calendlyEventUri: string,
  status: "pending" | "confirmed" | "cancelled" | "completed"
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sws2026_calendly_bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("calendly_event_uri", calendlyEventUri);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
