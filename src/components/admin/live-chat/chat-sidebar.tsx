"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, Clock, ExternalLink } from "lucide-react";
import type { ChatConversationWithDetails } from "@/types/live-chat";

interface ChatSidebarProps {
  conversations: ChatConversationWithDetails[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "No messages";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ChatSidebarProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          When visitors start chatting, their conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">Conversations</h2>
        <p className="text-sm text-muted-foreground">
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              "w-full p-4 text-left border-b border-border transition-colors",
              "hover:bg-muted/50",
              activeConversationId === conversation.id && "bg-muted",
              conversation.status === "active" && !conversation.admin_has_replied && conversation.last_message && "bg-green-50 dark:bg-green-950/30"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              {/* Visitor name/ID */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {(conversation.visitor_name || conversation.visitor_id)
                      .substring(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {conversation.visitor_name ||
                      `Visitor ${conversation.visitor_id.substring(0, 8)}`}
                  </div>
                  {conversation.visitor_email && (
                    <div className="text-xs text-muted-foreground truncate max-w-32">
                      {conversation.visitor_email}
                    </div>
                  )}
                  {conversation.post && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-32">
                        {conversation.post.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Time and unread badge */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(conversation.last_message_at)}
                </span>
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>

            {/* Last message preview */}
            {conversation.last_message && (
              <p className="text-sm text-muted-foreground ml-10 truncate">
                {conversation.last_message.sender_type === "admin" && (
                  <span className="text-primary">You: </span>
                )}
                {truncateText(conversation.last_message.content, 50)}
              </p>
            )}

            {/* Status badge */}
            {conversation.status !== "active" && (
              <span
                className={cn(
                  "inline-block ml-10 mt-1 text-xs px-2 py-0.5 rounded-full",
                  conversation.status === "closed"
                    ? "bg-muted text-muted-foreground"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                )}
              >
                {conversation.status}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
