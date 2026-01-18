"use client";

import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/live-chat";

interface ChatMessageProps {
  message: ChatMessageType;
  isAdmin?: boolean;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ message, isAdmin = false }: ChatMessageProps) {
  const isFromAdmin = message.sender_type === "admin";

  return (
    <div
      className={cn(
        "flex mb-3",
        isFromAdmin ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2",
          isFromAdmin
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Time and read status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isFromAdmin ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-xs",
              isFromAdmin
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
            )}
          >
            {formatTime(message.created_at)}
          </span>

          {/* Read receipts (only for admin messages) */}
          {isFromAdmin && isAdmin && (
            <span className="text-primary-foreground/70">
              {message.is_read ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
