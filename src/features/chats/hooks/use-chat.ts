import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { chatService, Conversation, Message, User } from '@/services/chat.api';
import type { Notification } from '@/services/chat.api';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';

interface TypingUser {
  userId: number;
  username: string;
  conversationId: number;
}

interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface NotificationsResponse {
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
}

interface MessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const useChat = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  const [currentMessages, setCurrentMessages] = useState<{ [conversationId: number]: Message[] }>({});
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const typingTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof chatService.connect> | null>(null);
  
  // SWR for conversations with caching
  const {
    data: conversationsData,
    error: conversationsError,
    mutate: mutateConversations,
    isLoading: conversationsLoading,
  } = useSWR<ConversationsResponse>(
    isAuthenticated ? '/api/chat/conversations?page=1&limit=20' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  // SWR for notifications with caching
  const {
    data: notificationsData,
    error: notificationsError,
    mutate: mutateNotifications,
    isLoading: notificationsLoading,
  } = useSWR<NotificationsResponse>(
    isAuthenticated ? '/api/chat/notifications?page=1&limit=20' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Cache for 10 seconds (more frequent for notifications)
    }
  );

  // Memoized derived state
  const conversations = useMemo(() => conversationsData?.conversations || [], [conversationsData]);
  const notifications = useMemo(() => notificationsData?.notifications || [], [notificationsData]);
  const unreadNotificationCount = useMemo(() => notificationsData?.unreadCount || 0, [notificationsData]);
  const loading = conversationsLoading || notificationsLoading;

  // Initialize socket connection only once when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clean up if not authenticated
      if (socketRef.current) {
        chatService.removeAllListeners();
        chatService.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      setCurrentMessages({});
      setSelectedConversation(null);
      return;
    }

    // Prevent multiple connections
    if (socketRef.current) {
      return;
    }

    const initializeChat = async () => {
      try {
        // Connect to socket 
        const socket = chatService.connect();
        socketRef.current = socket;
        
        // Connection event handlers
        chatService.onConnect(() => {
          setConnected(true);
          setConnectionError(null);
        });
        
        chatService.onDisconnect(() => {
          setConnected(false);
        });

        chatService.onConnectError((error) => {
          console.error('Socket connection error:', error);
          setConnected(false);
          setConnectionError(error.message || 'Connection failed');
        });
        
        // Set up chat event listeners
        chatService.onNewMessage(handleNewMessage);
        chatService.onMessagesRead(handleMessagesRead);
        chatService.onUserTyping(handleUserTyping);
        chatService.onUserStoppedTyping(handleUserStoppedTyping);
        chatService.onNewNotification(handleNewNotification);

        chatService.onMessageError((error) => {
          console.error('Message error:', error);
        });
        
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setConnectionError('Failed to initialize chat');
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        chatService.removeAllListeners();
        chatService.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id]); // Stable dependencies

  // Join conversation rooms when conversations change
  useEffect(() => {
    if (connected && conversations.length > 0) {
      const conversationIds = conversations.map(c => c.id);
      chatService.joinConversations(conversationIds);
    }
  }, [connected, conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewMessage = useCallback((message: Message) => {
    setCurrentMessages(prev => ({
      ...prev,
      [message.conversationId]: [...(prev[message.conversationId] || []), message]
    }));
    
    // Optimistically update conversations cache
    mutateConversations((current) => {
      if (!current) return current;
      
      const updatedConversations = current.conversations.map(conv => 
        conv.id === message.conversationId 
          ? { 
              ...conv, 
              lastMessage: message, 
              updatedAt: new Date().toISOString(),
              unreadCount: message.senderId !== getCurrentUserId() 
                ? conv.unreadCount + 1 
                : conv.unreadCount
            }
          : conv
      );
      
      // Sort by updatedAt descending
      updatedConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      return {
        ...current,
        conversations: updatedConversations
      };
    }, false); // Don't revalidate immediately
  }, [mutateConversations]);

  const handleMessagesRead = useCallback((data: { userId: number; messageIds: number[]; conversationId: number }) => {
    // Update read receipts in current messages
    setCurrentMessages(prev => ({
      ...prev,
      [data.conversationId]: prev[data.conversationId]?.map(msg => 
        data.messageIds.includes(msg.id) 
          ? {
              ...msg, 
              readReceipts: [
                ...(msg.readReceipts || []),
                { 
                  id: Date.now(), 
                  userId: data.userId, 
                  readAt: new Date().toISOString(), 
                  user: { 
                    id: data.userId, 
                    username: '', 
                    firstName: null, 
                    lastName: null 
                  } 
                }
              ]
            }
          : msg
      ) || []
    }));

    // Update unread count if current user read messages
    if (data.userId === getCurrentUserId()) {
      mutateConversations((current) => {
        if (!current) return current;
        
        return {
          ...current,
          conversations: current.conversations.map(conv => 
            conv.id === data.conversationId 
              ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - data.messageIds.length) }
              : conv
          )
        };
      }, false);
    }
  }, [mutateConversations]);

  const handleUserTyping = useCallback((data: TypingUser) => {
    setTypingUsers(prev => {
      const existing = prev.find(u => u.userId === data.userId && u.conversationId === data.conversationId);
      if (!existing) {
        return [...prev, data];
      }
      return prev;
    });
    
    // Clear typing after 3 seconds
    const key = `${data.userId}-${data.conversationId}`;
    if (typingTimeouts.current[key]) {
      clearTimeout(typingTimeouts.current[key]);
    }
    typingTimeouts.current[key] = setTimeout(() => {
      handleUserStoppedTyping({ userId: data.userId, conversationId: data.conversationId });
    }, 3000);
  }, []);

  const handleUserStoppedTyping = useCallback((data: { userId: number; conversationId: number }) => {
    setTypingUsers(prev => 
      prev.filter(u => !(u.userId === data.userId && u.conversationId === data.conversationId))
    );
    
    const key = `${data.userId}-${data.conversationId}`;
    if (typingTimeouts.current[key]) {
      clearTimeout(typingTimeouts.current[key]);
      delete typingTimeouts.current[key];
    }
  }, []);

  const handleNewNotification = useCallback((notification: Notification) => {
    // Optimistically update notifications cache
    mutateNotifications((current) => {
      if (!current) return current;
      
      // Check if this notification already exists
      const existingIndex = current.notifications.findIndex(n => n.id === notification.id);
      let updatedNotifications;
      let updatedUnreadCount = current.unreadCount;
      
      if (existingIndex !== -1) {
        // Update existing notification
        updatedNotifications = [...current.notifications];
        updatedNotifications[existingIndex] = notification;
      } else {
        // Add new notification at the beginning
        updatedNotifications = [notification, ...current.notifications];
        if (!notification.isRead) {
          updatedUnreadCount += 1;
        }
      }
      
      return {
        ...current,
        notifications: updatedNotifications,
        unreadCount: updatedUnreadCount
      };
    }, false);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted' && notification.type === 'NEW_MESSAGE') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/logo.webp',
      });
    }
  }, [mutateNotifications]);

  // Load messages for a specific conversation
  const loadMessages = async (conversationId: number, page = 1) => {
    try {
      const response = await chatService.getConversationMessages(conversationId, page);
      
      if (response.success) {
        if (page === 1) {
          setCurrentMessages(prev => ({
            ...prev,
            [conversationId]: response.messages
          }));
        } else {
          // Prepend older messages for pagination
          setCurrentMessages(prev => ({
            ...prev,
            [conversationId]: [...response.messages, ...(prev[conversationId] || [])]
          }));
        }
        
        return response;
      }
      return null;
    } catch (error) {
      console.error('Failed to load messages:', error);
      return null;
    }
  };

  const createConversation = async (participantIds: number[], name?: string, isGroup = false) => {
    try {
      const response = await chatService.createConversation({
        name,
        participantIds,
        isGroup
      });
      
      if (response.success) {
        // Check if this conversation already exists in our state
        const existingConvIndex = conversations.findIndex(conv => conv.id === response.conversation.id);
        
        if (existingConvIndex >= 0) {
          // If conversation already exists, don't add it again, just return the existing one
          return conversations[existingConvIndex];
        } else {
          // Optimistically update conversations cache
          mutateConversations((current) => {
            if (!current) return current;
            
            // Double check to avoid race conditions
            if (current.conversations.some(conv => conv.id === response.conversation.id)) {
              return current;
            }
            return {
              ...current,
              conversations: [response.conversation, ...current.conversations]
            };
          }, false);
          
          return response.conversation;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const sendMessage = async (conversationId: number, content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT') => {
    if (!content.trim() || !connected) return;
    
    chatService.sendMessage({ conversationId, content, messageType });
  };

  const markMessagesAsRead = (conversationId: number, messageIds: number[]) => {
    if (!connected || messageIds.length === 0) return;
    
    chatService.markMessagesRead({ conversationId, messageIds });
  };

  const markNotificationsAsRead = async (notificationIds?: number[], markAll = false) => {
    try {
      const response = await chatService.markNotificationsRead(notificationIds, markAll);
      
      if (response.success) {
        // Optimistically update notifications cache
        mutateNotifications((current) => {
          if (!current) return current;
          
          let updatedNotifications = current.notifications;
          let updatedUnreadCount = current.unreadCount;
          
          if (markAll) {
            updatedNotifications = updatedNotifications.map(n => ({ ...n, isRead: true }));
            updatedUnreadCount = 0;
          } else if (notificationIds) {
            const actuallyMarked = updatedNotifications.filter(n => 
              notificationIds.includes(n.id) && !n.isRead
            ).length;
            
            updatedNotifications = updatedNotifications.map(n => 
              notificationIds.includes(n.id) ? { ...n, isRead: true } : n
            );
            updatedUnreadCount = Math.max(0, updatedUnreadCount - actuallyMarked);
          }
          
          return {
            ...current,
            notifications: updatedNotifications,
            unreadCount: updatedUnreadCount
          };
        }, false);
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    try {
      const response = await chatService.searchUsers(query);
      return response.success ? response.users : [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  };

  const startTyping = (conversationId: number) => {
    if (connected) {
      chatService.startTyping(conversationId);
    }
  };

  const stopTyping = (conversationId: number) => {
    if (connected) {
      chatService.stopTyping(conversationId);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Load messages if not already loaded
    if (!currentMessages[conversation.id]) {
      await loadMessages(conversation.id);
    }
    
    // Mark messages as read
    const messages = currentMessages[conversation.id] || [];
    const unreadMessageIds = messages
      .filter(msg => msg.senderId !== getCurrentUserId() && !hasUserReadMessage(msg, getCurrentUserId()))
      .map(msg => msg.id);
    
    if (unreadMessageIds.length > 0) {
      markMessagesAsRead(conversation.id, unreadMessageIds);
    }
  };

  // Helper functions
  const getCurrentUserId = (): number => {
    return user?.id || 0;
  };

  const hasUserReadMessage = (message: Message, userId: number): boolean => {
    return message.readReceipts?.some(receipt => receipt.userId === userId) || false;
  };

  const getConversationName = (conversation: Conversation): string => {
    if (conversation.isGroup) {
      return conversation.name || 'Group Chat';
    }
    
    const otherParticipant = conversation.participants.find(p => p.userId !== getCurrentUserId());
    if (otherParticipant) {
      const { firstName, lastName, username } = otherParticipant.user;
      return `${firstName || ''} ${lastName || ''}`.trim() || username;
    }
    
    return 'Unknown';
  };

  const getTypingUsersInConversation = (conversationId: number): TypingUser[] => {
    return typingUsers.filter(user => 
      user.conversationId === conversationId && user.userId !== getCurrentUserId()
    );
  };

  const uploadFile = async (conversationId: number, file: File) => {
    try {
      const response = await chatService.uploadFile(conversationId, file);
      if (response.success) {
        // File upload success is handled by socket event (new_message)
        return response.message;
      } else {
        console.error('File upload failed with response:', response);
        throw new Error('Upload failed: Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  };

  // Manual refresh functions for when needed
  const refreshConversations = () => mutateConversations();
  const refreshNotifications = () => mutateNotifications();

  return {
    // State
    conversations,
    currentMessages,
    notifications,
    unreadNotificationCount,
    loading,
    connected,
    selectedConversation,
    typingUsers,
    messagesEndRef,
    connectionError,
    
    // Auth state
    isAuthenticated,
    currentUser: user,
    
    // Actions
    loadMessages,
    createConversation,
    sendMessage,
    markMessagesAsRead,
    markNotificationsAsRead,
    searchUsers,
    startTyping,
    stopTyping,
    selectConversation,
    uploadFile,
    refreshConversations,
    refreshNotifications,
    
    // Helpers
    getCurrentUserId,
    hasUserReadMessage,
    getConversationName,
    getTypingUsersInConversation,
  };
};