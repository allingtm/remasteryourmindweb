"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getLiveChatSettings } from "@/lib/supabase/queries/live-chat";
import type { UseChatPresenceReturn, LiveChatSettings } from "@/types/live-chat";

export function useChatPresence(): UseChatPresenceReturn {
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      // Fetch settings and block status in parallel
      const [settings, blockResponse] = await Promise.all([
        getLiveChatSettings(),
        fetch("/api/live-chat/check-blocked").then(res => res.json()).catch(() => ({ blocked: false })),
      ]);

      if (settings) {
        setIsAdminOnline(settings.is_online);
      }
      setIsBlocked(blockResponse.blocked === true);
      setError(null);
    } catch (err) {
      console.error("Error fetching chat settings:", err);
      setError("Failed to check admin availability");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Subscribe to real-time changes on the settings table
    const supabase = createClient();
    const channel = supabase
      .channel("live-chat-settings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sws2026_live_chat_settings",
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object" && "is_online" in payload.new) {
            setIsAdminOnline((payload.new as LiveChatSettings).is_online);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  return { isAdminOnline, isBlocked, isLoading, error };
}
