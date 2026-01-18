// Live Chat Settings
export interface LiveChatSettings {
  id: string;
  is_online: boolean;
  updated_at: string;
}

// Chat Conversation
export interface ChatConversation {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_ip: string | null;
  post_id: string | null;
  source_url: string | null;
  status: "active" | "closed" | "archived";
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

// Chat Conversation with relations
export interface ChatConversationWithDetails extends ChatConversation {
  post?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  last_message?: ChatMessage | null;
  unread_count?: number;
  admin_has_replied?: boolean;
}

// Chat Message
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: "visitor" | "admin";
  content: string;
  is_read: boolean;
  created_at: string;
}

// Typing state for real-time indicators
export interface TypingState {
  isTyping: boolean;
  text?: string; // Only used for visitor typing (admin can see what they're typing)
}

// Visitor typing payload (admin sees full text)
export interface VisitorTypingPayload {
  typing: boolean;
  text: string;
  visitor_id: string;
}

// Admin typing payload (visitor only sees indicator)
export interface AdminTypingPayload {
  typing: boolean;
}

// Chat channel events
export type ChatEvent = "visitor-typing" | "admin-typing" | "message-sent";

// Create conversation payload
export interface CreateConversationPayload {
  visitor_id: string;
  visitor_name?: string;
  post_id?: string;
  source_url?: string;
}

// Create message payload
export interface CreateMessagePayload {
  conversation_id: string;
  sender_type: "visitor" | "admin";
  content: string;
}

// Live chat hook return type
export interface UseLiveChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  visitorTyping: TypingState;
  adminTyping: TypingState;
  setTyping: (isTyping: boolean, text?: string) => void;
}

// Admin chat hook return type
export interface UseAdminChatReturn {
  conversations: ChatConversationWithDetails[];
  activeConversation: ChatConversationWithDetails | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  selectConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  visitorTyping: TypingState;
  setTyping: (isTyping: boolean) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  closeConversation: (conversationId: string) => Promise<void>;
}

// Presence hook return type
export interface UseChatPresenceReturn {
  isAdminOnline: boolean;
  isBlocked: boolean;
  isLoading: boolean;
  error: string | null;
}

// Settings hook return type
export interface UseChatSettingsReturn {
  settings: LiveChatSettings | null;
  isLoading: boolean;
  error: string | null;
  toggleOnline: () => Promise<void>;
}

// Blocked IP
export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  blocked_by: string | null;
  created_at: string;
}
