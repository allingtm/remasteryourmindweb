"use client";

import { LiveChatWidget } from "./live-chat-widget";
import { useLiveChatConfigSafe } from "./live-chat-context";

// Shortcode component for markdown that accepts string props
interface LiveChatShortcodeProps {
  className?: string;
  title?: string;
  description?: string;
}

export function LiveChatShortcode({ className, title, description }: LiveChatShortcodeProps) {
  const liveChatContext = useLiveChatConfigSafe();

  // If no context or config, don't render
  if (!liveChatContext || !liveChatContext.config) {
    return null;
  }

  const { postId } = liveChatContext.config;

  return (
    <div className={`my-6 not-prose ${className || ""}`}>
      <LiveChatWidget postId={postId} title={title} description={description} />
    </div>
  );
}
