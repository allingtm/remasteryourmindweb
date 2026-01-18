"use client";

import { ChatNotificationModal } from "@/components/admin/chat-notification-modal";
import { useChatNotifications } from "@/hooks/use-chat-notifications";

/**
 * Global wrapper for admin chat notifications.
 * This component can be placed in the root layout to show notifications
 * across all pages when an admin is logged in.
 *
 * The useChatNotifications hook internally checks if the user is authenticated
 * and only subscribes to notifications when they are.
 */
export function AdminChatNotificationWrapper() {
  const { newChat, dismissNotification } = useChatNotifications();

  // The hook returns null for newChat when not authenticated,
  // and the modal only renders when newChat is not null
  return <ChatNotificationModal chat={newChat} onDismiss={dismissNotification} />;
}
