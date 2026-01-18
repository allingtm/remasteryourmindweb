"use client";

import { useState } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnlineToggle, ChatSidebar, ChatWindow } from "@/components/admin/live-chat";
import { useAdminChat } from "@/hooks/use-admin-chat";
import { cn } from "@/lib/utils";

export default function LiveChatPage() {
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    error,
    settings,
    visitorTyping,
    selectConversation,
    sendMessage,
    setAdminTyping,
    closeConversation,
    toggleOnline,
    refreshConversations,
    clearActiveConversation,
  } = useAdminChat();

  // Mobile: toggle between list and chat view
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const handleSelectConversation = async (id: string) => {
    await selectConversation(id);
    setShowChatOnMobile(true);
  };

  const handleCloseChat = () => {
    setShowChatOnMobile(false);
  };

  const handleCloseConversation = async () => {
    if (activeConversation) {
      await closeConversation(activeConversation.id);
      setShowChatOnMobile(false);
    }
  };

  const handleDeleteConversation = () => {
    clearActiveConversation();
    setShowChatOnMobile(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-border bg-background">
        <div>
          <h1 className="text-2xl font-bold">Live Chat</h1>
          <p className="text-sm text-muted-foreground">
            Manage real-time conversations with visitors
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <Button
            variant="outline"
            size="icon"
            onClick={refreshConversations}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Online toggle */}
          {settings && (
            <OnlineToggle
              isOnline={settings.is_online}
              onToggle={toggleOnline}
            />
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (conversation list) */}
        <div
          className={cn(
            "w-full lg:w-80 lg:border-r border-border flex-shrink-0",
            showChatOnMobile && "hidden lg:block"
          )}
        >
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversation?.id || null}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Chat window */}
        <div
          className={cn(
            "flex-1 min-w-0",
            !showChatOnMobile && "hidden lg:block"
          )}
        >
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              visitorTyping={visitorTyping}
              onSendMessage={sendMessage}
              onTyping={setAdminTyping}
              onClose={handleCloseChat}
              onCloseConversation={handleCloseConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground max-w-sm">
                Choose a conversation from the sidebar to start chatting with visitors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
