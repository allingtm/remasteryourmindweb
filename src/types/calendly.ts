// Calendly API Types

export interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number; // in minutes
  kind: "solo" | "group";
  pooling_type: "round_robin" | "collective" | null;
  type: "StandardEventType" | "AdhocEventType";
  color: string;
  description_plain: string | null;
  description_html: string | null;
  profile: {
    type: string;
    name: string;
    owner: string;
  };
  secret: boolean;
  booking_method: "instant" | "poll";
}

export interface CalendlyAvailableTime {
  status: "available" | "unavailable";
  invitees_remaining: number;
  start_time: string; // ISO 8601
  scheduling_url: string;
}

export interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  status: "active" | "cancelled";
  start_time: string;
  end_time: string;
  event_type: string;
  location: CalendlyLocation;
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
  event_memberships: Array<{
    user: string;
  }>;
}

export interface CalendlyLocation {
  type: string;
  location?: string;
  join_url?: string;
  status?: string;
  additional_info?: string;
}

export interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  status: "active" | "cancelled";
  timezone: string;
  event: string;
  created_at: string;
  updated_at: string;
  questions_and_answers: Array<{
    question: string;
    answer: string;
    position: number;
  }>;
  tracking: {
    utm_campaign?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_content?: string;
    utm_term?: string;
    salesforce_uuid?: string;
  };
  cancel_url: string;
  reschedule_url: string;
}

// Booking form types
export interface CalendlyBookingFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  selectedTime: string;
  timezone: string;
}

// Database record type
export interface CalendlyBooking {
  id: string;
  post_id: string | null;
  calendly_event_uri: string | null;
  event_type_uri: string;
  event_start_time: string;
  invitee_name: string;
  invitee_email: string;
  invitee_phone: string | null;
  invitee_company: string | null;
  invitee_message: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

// API response types
export interface CalendlyApiResponse<T> {
  resource?: T;
  collection?: T[];
  pagination?: {
    count: number;
    next_page: string | null;
    previous_page: string | null;
    next_page_token: string | null;
    previous_page_token: string | null;
  };
}
