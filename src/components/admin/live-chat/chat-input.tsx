"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onTyping?: (isTyping: boolean, text?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showTypingText?: boolean; // Whether to send the text while typing (for visitors)
}

export function ChatInput({
  onSend,
  onTyping,
  placeholder = "Type a message...",
  disabled = false,
  showTypingText = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea (only on larger screens)
  useEffect(() => {
    if (textareaRef.current) {
      // Skip auto-resize on mobile to prevent layout issues with keyboard
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.overflowY = "hidden";
        return;
      }

      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      // Only show overflow when content exceeds max height
      textareaRef.current.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [message]);

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage("");

    // Reset typing state
    onTyping?.(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Broadcast typing state
    if (showTypingText) {
      onTyping?.(newValue.length > 0, newValue);
    } else {
      onTyping?.(newValue.length > 0);
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-border bg-background w-full max-w-full box-border">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          "flex-1 min-w-0 resize-none rounded-xl border border-input bg-background px-4 py-3",
          "text-base sm:text-sm placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "max-h-30"
        )}
      />
      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || disabled}
        size="icon"
        className="h-10 w-10 rounded-full shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
