"use client";

import { createContext, useContext, ReactNode } from "react";

interface LiveChatConfig {
  postId: string;
}

interface LiveChatContextValue {
  config: LiveChatConfig | null;
}

const LiveChatContext = createContext<LiveChatContextValue | null>(null);

interface LiveChatProviderProps {
  children: ReactNode;
  config: LiveChatConfig | null;
}

export function LiveChatProvider({ children, config }: LiveChatProviderProps) {
  return (
    <LiveChatContext.Provider value={{ config }}>
      {children}
    </LiveChatContext.Provider>
  );
}

export function useLiveChatConfig() {
  const context = useContext(LiveChatContext);
  if (!context) {
    throw new Error("useLiveChatConfig must be used within a LiveChatProvider");
  }
  return context;
}

// Safe version that doesn't throw - useful for shortcode components
export function useLiveChatConfigSafe() {
  return useContext(LiveChatContext);
}
