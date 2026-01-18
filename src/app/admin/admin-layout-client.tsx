"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { ChatNotificationModal } from "@/components/admin/chat-notification-modal";
import { useChatNotifications } from "@/hooks/use-chat-notifications";
import type { BlogAuthor } from "@/types";

interface AdminLayoutClientProps {
  author: BlogAuthor;
  children: React.ReactNode;
}

export function AdminLayoutClient({
  author,
  children,
}: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { newChat, dismissNotification } = useChatNotifications();

  return (
    <div className="min-h-screen bg-muted/30">
      <ChatNotificationModal chat={newChat} onDismiss={dismissNotification} />
      <div className="flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <AdminHeader
            author={author}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
