"use client";

import { useEffect, useRef, useState } from "react";
import { X, MoreVertical, ExternalLink, Ban, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { blockIP, deleteConversation } from "@/lib/supabase/mutations/live-chat";
import type { ChatConversationWithDetails, ChatMessage as ChatMessageType, TypingState } from "@/types/live-chat";

interface ChatWindowProps {
  conversation: ChatConversationWithDetails;
  messages: ChatMessageType[];
  visitorTyping: TypingState;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onClose: () => void;
  onCloseConversation: () => void;
  onDeleteConversation: () => void;
}

export function ChatWindow({
  conversation,
  messages,
  visitorTyping,
  onSendMessage,
  onTyping,
  onClose,
  onCloseConversation,
  onDeleteConversation,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, visitorTyping]);

  const visitorDisplayName =
    conversation.visitor_name ||
    `Visitor ${conversation.visitor_id.substring(0, 8)}`;

  const handleBlockVisitor = async () => {
    if (!conversation.visitor_ip) {
      alert("Cannot block visitor: IP address not available");
      return;
    }

    setIsBlocking(true);
    try {
      const result = await blockIP(
        conversation.visitor_ip,
        `Blocked from conversation ${conversation.id}`
      );

      if (result.success) {
        // Also close the conversation
        onCloseConversation();
        setShowBlockDialog(false);
      } else {
        alert(result.error || "Failed to block visitor");
      }
    } catch (err) {
      console.error("Error blocking visitor:", err);
      alert("Failed to block visitor");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleDeleteConversation = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteConversation(conversation.id);
      if (result.success) {
        setShowDeleteDialog(false);
        onDeleteConversation();
      } else {
        alert(result.error || "Failed to delete conversation");
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
      alert("Failed to delete conversation");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Back button (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Visitor avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {visitorDisplayName.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Visitor info */}
          <div>
            <h3 className="font-medium">{visitorDisplayName}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {conversation.visitor_email && (
                <span>{conversation.visitor_email}</span>
              )}
              {conversation.visitor_email && conversation.post && (
                <span>•</span>
              )}
              {conversation.post ? (
                <a
                  href={`/blog/${conversation.post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <ExternalLink className="w-3 h-3" />
                  {conversation.post.title}
                </a>
              ) : !conversation.visitor_email ? (
                <span>Direct chat</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseConversation}
            className="text-muted-foreground hover:text-destructive"
          >
            Close chat
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowBlockDialog(true)}
                className="text-destructive focus:text-destructive"
                disabled={!conversation.visitor_ip}
              >
                <Ban className="mr-2 h-4 w-4" />
                Block visitor
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Block confirmation dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block this visitor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will block the visitor's IP address ({conversation.visitor_ip || "unknown"})
              from starting new chat conversations. The current conversation will be closed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockVisitor}
              disabled={isBlocking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBlocking ? "Blocking..." : "Block visitor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Waiting for {visitorDisplayName} to send a message...
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} isAdmin />
            ))}
          </>
        )}

        {/* Visitor typing indicator with live text */}
        {visitorTyping.isTyping && (
          <div className="flex items-start gap-2 mb-3">
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-4 py-2">
              {visitorTyping.text ? (
                <p className="text-sm text-muted-foreground italic">
                  {visitorTyping.text}
                </p>
              ) : (
                <TypingIndicator />
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input or closed notice */}
      {conversation.status === "active" ? (
        <ChatInput
          onSend={onSendMessage}
          onTyping={onTyping}
          placeholder="Type a message..."
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            This conversation has been {conversation.status}.
          </p>
        </div>
      )}
    </div>
  );
}
