// Calendly API Client with lazy initialization pattern
import type {
  CalendlyUser,
  CalendlyEventType,
  CalendlyAvailableTime,
  CalendlyApiResponse,
} from "@/types/calendly";

class CalendlyClient {
  private baseUrl = "https://api.calendly.com";
  private accessToken: string | null = null;
  private userUri: string | null = null;

  private getAccessToken(): string {
    if (!this.accessToken) {
      this.accessToken = process.env.CALENDLY_ACCESS_TOKEN || null;
      if (!this.accessToken) {
        throw new Error("CALENDLY_ACCESS_TOKEN environment variable is not set");
      }
    }
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message ||
          `Calendly API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async getCurrentUser(): Promise<CalendlyUser> {
    const response = await this.request<CalendlyApiResponse<CalendlyUser>>(
      "/users/me"
    );
    if (!response.resource) {
      throw new Error("Failed to get current user");
    }
    this.userUri = response.resource.uri;
    return response.resource;
  }

  async getUserUri(): Promise<string> {
    if (!this.userUri) {
      await this.getCurrentUser();
    }
    return this.userUri!;
  }

  async getEventTypes(): Promise<CalendlyEventType[]> {
    const userUri = await this.getUserUri();
    const response = await this.request<CalendlyApiResponse<CalendlyEventType>>(
      `/event_types?user=${encodeURIComponent(userUri)}&active=true`
    );
    return response.collection || [];
  }

  async getEventType(eventTypeUri: string): Promise<CalendlyEventType> {
    const response = await this.request<CalendlyApiResponse<CalendlyEventType>>(
      eventTypeUri
    );
    if (!response.resource) {
      throw new Error("Event type not found");
    }
    return response.resource;
  }

  async getAvailableTimes(
    eventTypeUri: string,
    startTime: string,
    endTime: string
  ): Promise<CalendlyAvailableTime[]> {
    const params = new URLSearchParams({
      event_type: eventTypeUri,
      start_time: startTime,
      end_time: endTime,
    });

    const response = await this.request<
      CalendlyApiResponse<CalendlyAvailableTime>
    >(`/event_type_available_times?${params}`);
    return response.collection || [];
  }

  /**
   * Build a Calendly scheduling URL with prefilled invitee data
   */
  buildSchedulingUrl(
    schedulingUrl: string,
    prefillData: {
      name?: string;
      email?: string;
      customAnswers?: Record<string, string>;
      date?: string; // YYYY-MM format for month
    }
  ): string {
    const url = new URL(schedulingUrl);

    if (prefillData.name) {
      url.searchParams.set("name", prefillData.name);
    }
    if (prefillData.email) {
      url.searchParams.set("email", prefillData.email);
    }
    if (prefillData.date) {
      url.searchParams.set("month", prefillData.date);
    }

    // Custom answers use a1, a2, etc. for custom questions
    if (prefillData.customAnswers) {
      Object.entries(prefillData.customAnswers).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return url.toString();
  }
}

// Singleton instance with lazy initialization
let calendlyClientInstance: CalendlyClient | null = null;

export function getCalendlyClient(): CalendlyClient {
  if (!calendlyClientInstance) {
    calendlyClientInstance = new CalendlyClient();
  }
  return calendlyClientInstance;
}

// Check if Calendly is configured
export function isCalendlyConfigured(): boolean {
  return !!process.env.CALENDLY_ACCESS_TOKEN;
}
