import { createClient } from "../server";
import type { CalendlyBooking } from "@/types/calendly";

export async function getCalendlyBookingsByPost(
  postId: string,
  status?: "pending" | "confirmed" | "cancelled" | "completed"
): Promise<CalendlyBooking[]> {
  const supabase = await createClient();

  let query = supabase
    .from("sws2026_calendly_bookings")
    .select("*")
    .eq("post_id", postId)
    .order("event_start_time", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Calendly bookings:", error);
    return [];
  }

  return data as CalendlyBooking[];
}

export async function getCalendlyBookingByEmail(
  email: string
): Promise<CalendlyBooking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sws2026_calendly_bookings")
    .select("*")
    .eq("invitee_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching Calendly bookings by email:", error);
    return [];
  }

  return data as CalendlyBooking[];
}

export async function getAllCalendlyBookings(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ bookings: CalendlyBooking[]; total: number }> {
  const supabase = await createClient();
  const { status, limit = 20, offset = 0 } = options || {};

  let query = supabase
    .from("sws2026_calendly_bookings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching all Calendly bookings:", error);
    return { bookings: [], total: 0 };
  }

  return {
    bookings: data as CalendlyBooking[],
    total: count || 0,
  };
}
