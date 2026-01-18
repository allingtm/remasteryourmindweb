"use client";

import { useState, useEffect } from "react";

const VISITOR_ID_KEY = "sws_live_chat_visitor_id";

// Generate a random visitor ID (UUID v4 style)
function generateVisitorId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useVisitorId(): string {
  const [visitorId, setVisitorId] = useState<string>("");

  useEffect(() => {
    // Check if we already have a visitor ID in localStorage
    let id = localStorage.getItem(VISITOR_ID_KEY);

    if (!id) {
      // Generate a new visitor ID
      id = generateVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }

    setVisitorId(id);
  }, []);

  return visitorId;
}
