"use client";

import { useState, useEffect } from "react";
import { Calendar, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendlyEventType } from "@/types/calendly";

interface CalendlySettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  eventTypeUri: string;
  onEventTypeUriChange: (uri: string) => void;
  schedulingUrl: string;
  onSchedulingUrlChange: (url: string) => void;
  ctaTitle: string;
  onCtaTitleChange: (title: string) => void;
  ctaDescription: string;
  onCtaDescriptionChange: (description: string) => void;
}

export function CalendlySettings({
  enabled,
  onEnabledChange,
  eventTypeUri,
  onEventTypeUriChange,
  schedulingUrl,
  onSchedulingUrlChange,
  ctaTitle,
  onCtaTitleChange,
  ctaDescription,
  onCtaDescriptionChange,
}: CalendlySettingsProps) {
  const [eventTypes, setEventTypes] = useState<CalendlyEventType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    async function fetchEventTypes() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/calendly/event-types");

        if (response.status === 503) {
          setIsConfigured(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch event types");
        }

        const data = await response.json();
        const fetchedEventTypes = data.eventTypes || [];
        setEventTypes(fetchedEventTypes);

        // If there's already a selected event type but no scheduling URL, populate it
        if (eventTypeUri && !schedulingUrl) {
          const selectedEventType = fetchedEventTypes.find(
            (et: CalendlyEventType) => et.uri === eventTypeUri
          );
          if (selectedEventType?.scheduling_url) {
            onSchedulingUrlChange(selectedEventType.scheduling_url);
          }
        }
      } catch (err) {
        setError("Unable to load Calendly event types");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (enabled) {
      fetchEventTypes();
    }
  }, [enabled]);

  if (!isConfigured) {
    return (
      <div className="bg-background rounded-lg border border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Calendly Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Calendly is not configured. Add your CALENDLY_ACCESS_TOKEN to
          environment variables to enable booking.
        </p>
        <a
          href="https://calendly.com/integrations/api_webhooks"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
        >
          Get your API token
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Calendly Settings</h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </label>
      </div>

      {enabled && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Event Type <span className="text-destructive">*</span>
            </label>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading event types...
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <select
                value={eventTypeUri}
                onChange={(e) => {
                  const selectedUri = e.target.value;
                  onEventTypeUriChange(selectedUri);
                  // Also update the scheduling URL from the selected event type
                  const selectedEventType = eventTypes.find(et => et.uri === selectedUri);
                  onSchedulingUrlChange(selectedEventType?.scheduling_url || "");
                }}
                className={cn(
                  "w-full px-3 py-2 rounded-md border border-input bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              >
                <option value="">Select an event type</option>
                {eventTypes.map((eventType) => (
                  <option key={eventType.uri} value={eventType.uri}>
                    {eventType.name} ({eventType.duration} min)
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Select which Calendly event type to use for this post
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              CTA Title
            </label>
            <input
              type="text"
              value={ctaTitle}
              onChange={(e) => onCtaTitleChange(e.target.value)}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              placeholder="Schedule a Meeting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              CTA Description
            </label>
            <input
              type="text"
              value={ctaDescription}
              onChange={(e) => onCtaDescriptionChange(e.target.value)}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              placeholder="Book a free consultation to discuss your project"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional description shown below the title
            </p>
          </div>
        </>
      )}
    </div>
  );
}
