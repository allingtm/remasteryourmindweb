"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LiveChatDialog } from "./live-chat-dialog";
import { useChatPresence } from "@/hooks/use-chat-presence";

interface LiveChatWidgetProps {
  postId?: string;
  title?: string;
  description?: string;
}

export function LiveChatWidget({
  postId,
  title = "Chat with us",
  description,
}: LiveChatWidgetProps) {
  const { isAdminOnline, isBlocked, isLoading } = useChatPresence();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Get current URL for source tracking
  const sourceUrl = typeof window !== "undefined" ? window.location.href : "";

  // If loading, admin is offline, or user is blocked, don't render anything
  if (isLoading || !isAdminOnline || isBlocked) {
    return null;
  }

  // Admin is online - show live chat button
  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className="inline-flex items-center gap-2"
      >
        <div className="relative">
          <MessageCircle className="h-4 w-4" />
          {/* Online indicator dot */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
        </div>
        {title}
      </Button>

      {isChatOpen && (
        <LiveChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          postId={postId}
          sourceUrl={sourceUrl}
          title={title}
          description={description}
        />
      )}
    </>
  );
}

// Floating button variant (can be used for fixed position chat button)
export function LiveChatFloatingButton({
  postId,
  title,
  description,
}: LiveChatWidgetProps) {
  const { isAdminOnline, isBlocked, isLoading } = useChatPresence();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const sourceUrl = typeof window !== "undefined" ? window.location.href : "";

  // If loading, admin is offline, or user is blocked, don't show anything
  if (isLoading || !isAdminOnline || isBlocked) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-primary"
            />
          </div>
        </motion.button>
      </AnimatePresence>

      {isChatOpen && (
        <LiveChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          postId={postId}
          sourceUrl={sourceUrl}
          title={title}
          description={description}
        />
      )}
    </>
  );
}
