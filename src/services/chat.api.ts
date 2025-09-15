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
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private connectionPromise: Promise<Socket> | null = null;

  constructor() {
    // No need to store token since we're using HTTP-only cookies
  }

  // Initialize socket connection with singleton pattern
  connect(): Socket {
    // If already connected, return existing socket
    if (this.socket?.connected) {
      return this.socket;
    }

    // If already connecting, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      return this.socket!; // We know it exists because we're connecting
    }

    // If disconnected but socket exists, try to reconnect
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
      return this.socket;
    }

    this.isConnecting = true;

    try {
      // For HTTP-only cookies, let socket.io use cookies automatically
      // The server will read the HTTP-only cookie from headers
      this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
        withCredentials: true, // This ensures cookies are sent with the connection
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000, // Max 10 seconds
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000, // 20 second connection timeout
      });

      // Set up connection event handlers
      this.socket.on('connect', () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000; // Reset delay
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnecting = false;
        
        // Auto-reconnect for certain disconnect reasons
        if (reason === 'transport error' || reason === 'transport close') {
          this.handleReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnecting = false;
        this.handleReconnect();
      });

      this.socket.on('reconnect', (attemptNumber) => {
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed after maximum attempts');
        this.isConnecting = false;
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      this.isConnecting = false;
      throw new Error('Failed to connect to chat server');
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    setTimeout(() => {
      if (!this.socket?.connected && !this.isConnecting) {
        this.connect();
      }
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // HTTP API methods with proper error handling
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

  // Socket event emitters with connection checks
  joinConversations(conversationIds: number[]) {
    if (this.socket?.connected) {
      this.socket.emit('join_conversations', conversationIds);
    } else {
      console.warn('Cannot join conversations: socket not connected');
    }
  }

  sendMessage(data: { conversationId: number; content: string; messageType?: 'TEXT' | 'IMAGE' | 'FILE' }) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', data);
    } else {
      console.warn('Cannot send message: socket not connected');
    }
  }

  markMessagesRead(data: { conversationId: number; messageIds: number[] }) {
    if (this.socket?.connected) {
      this.socket.emit('mark_messages_read', data);
    } else {
      console.warn('Cannot mark messages read: socket not connected');
    }
  }

  startTyping(conversationId: number) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId: number) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  // Event listeners with null checks
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

  // Cleanup with improved listener management
  removeAllListeners() {
    if (this.socket) {
      // Remove only our custom listeners, keep connection management listeners
      const eventsToRemove = [
        'new_message',
        'messages_read', 
        'user_typing',
        'user_stopped_typing',
        'new_notification',
        'conversations_joined',
        'message_error'
      ];
      
      eventsToRemove.forEach(event => {
        this.socket?.removeAllListeners(event);
      });
    }
  }

  // Get connection status info
  getConnectionInfo() {
    return {
      connected: this.socket?.connected || false,
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      id: this.socket?.id
    };
  }
}

// Export singleton instance
export const chatService = new ChatService();