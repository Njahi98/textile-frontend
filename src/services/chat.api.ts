import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

export interface User {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email?: string;
  avatarUrl?: string | null;
}

export interface Conversation {
  id: number;
  name: string | null;
  isGroup: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  participants: {
    id: number;
    userId: number;
    isActive: boolean;
    user: User;
  }[];
  unreadCount: number;
  lastMessage: Message | null;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO';
  isEdited: boolean;
  isDeleted: boolean;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  filePublicId?: string | null;
  createdAt: string;
  updatedAt: string;
  sender: User;
  readReceipts?: {
    id: number;
    userId: number;
    readAt: string;
    user: User;
  }[];
}

export interface Notification {
  id: number;
  userId: number;
  type: 'NEW_MESSAGE' | 'MENTION' | 'SYSTEM' | 'PERFORMANCE_ALERT';
  title: string;
  content: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export interface CreateConversationData {
  name?: string;
  participantIds: number[];
  isGroup: boolean;
}

interface AuthenticatedSocket {
  userId: number;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

interface SocketWithAuth extends Socket {
  userId?: number;
  user?: AuthenticatedSocket['user'];
}

class ChatService {
  private socket: Socket | null = null;

  constructor() {
    // No need to store token since we're using HTTP-only cookies
  }

  // Initialize socket connection
  connect() {
    try {
      // For HTTP-only cookies, let socket.io use cookies automatically
      // The server will read the HTTP-only cookie from headers
      this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
        withCredentials: true, // This ensures cookies are sent with the connection
        transports: ['websocket', 'polling'],
        // Don't provide auth.token, let the server read from cookies in headers
        autoConnect: true,
      });
      return this.socket;
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      throw new Error('Failed to connect to chat server');
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

 
  async getConversations(page = 1, limit = 20): Promise<{ success: boolean; conversations: Conversation[] }> {
    const response = await api.get('/api/chat/conversations', {
      params: { page, limit }
    });
    return response.data;
  }

  async createConversation(data: CreateConversationData): Promise<{ success: boolean; conversation: Conversation; message: string }> {
    const response = await api.post('/api/chat/conversations', data);
    return response.data;
  }

  async getConversationMessages(conversationId: number, page = 1, limit = 50): Promise<{
    success: boolean;
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const response = await api.get(`/api/chat/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  }

  async searchUsers(query: string): Promise<{ success: boolean; users: User[] }> {
    const response = await api.get('/api/chat/users/search', {
      params: { q: query }
    });
    return response.data;
  }

  async getNotifications(page = 1, limit = 20): Promise<{
    success: boolean;
    notifications: Notification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const response = await api.get('/api/chat/notifications', {
      params: { page, limit }
    });
    return response.data;
  }

  async markNotificationsRead(notificationIds?: number[], markAll = false): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/api/chat/notifications/read', {
      notificationIds,
      markAll
    });
    return response.data;
  }

  async uploadFile(conversationId: number, file: File): Promise<{ success: boolean; message: Message }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/api/chat/conversations/${conversationId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

  // Socket event handlers
  joinConversations(conversationIds: number[]) {
    if (this.socket) {
      this.socket.emit('join_conversations', conversationIds);
    }
  }

  sendMessage(data: { conversationId: number; content: string; messageType?: 'TEXT' | 'IMAGE' | 'FILE' }) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  markMessagesRead(data: { conversationId: number; messageIds: number[] }) {
    if (this.socket) {
      this.socket.emit('mark_messages_read', data);
    }
  }

  startTyping(conversationId: number) {
    if (this.socket) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId: number) {
    if (this.socket) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  // Event listeners
  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onMessagesRead(callback: (data: { userId: number; messageIds: number[]; conversationId: number }) => void) {
    if (this.socket) {
      this.socket.on('messages_read', callback);
    }
  }

  onUserTyping(callback: (data: { userId: number; username: string; conversationId: number }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStoppedTyping(callback: (data: { userId: number; conversationId: number }) => void) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
    }
  }

  onNewNotification(callback: (notification: Notification) => void) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
    }
  }

  onConversationsJoined(callback: (conversationIds: number[]) => void) {
    if (this.socket) {
      this.socket.on('conversations_joined', callback);
    }
  }

  onMessageError(callback: (error: { error: string }) => void) {
    if (this.socket) {
      this.socket.on('message_error', callback);
    }
  }

  // Connection events
  onConnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('connect', callback);
    }
  }

  onDisconnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('disconnect', callback);
    }
  }

  onConnectError(callback: (error: Error) => void) {
    if (this.socket) {
      this.socket.on('connect_error', callback);
    }
  }

  // Cleanup
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const chatService = new ChatService();

