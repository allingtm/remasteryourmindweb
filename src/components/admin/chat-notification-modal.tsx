"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatConversation } from "@/types/live-chat";

interface ChatNotificationModalProps {
  chat: ChatConversation | null;
  onDismiss: () => void;
}

export function ChatNotificationModal({ chat, onDismiss }: ChatNotificationModalProps) {
  const router = useRouter();

  if (!chat) return null;

  const handleGoToChat = () => {
    onDismiss();
    router.push("/admin/live-chat");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onDismiss}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background rounded-xl shadow-2xl p-6 max-w-sm w-full"
        >
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-primary animate-bounce" />
            </div>
            <h2 className="text-xl font-semibold mb-2">New Chat Started!</h2>
            <p className="text-muted-foreground mb-4">
              {chat.visitor_name || "A visitor"} wants to chat
              {chat.visitor_email && (
                <span className="block text-sm">{chat.visitor_email}</span>
              )}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onDismiss}>
                Dismiss
              </Button>
              <Button onClick={handleGoToChat}>
                Go to Chat
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
