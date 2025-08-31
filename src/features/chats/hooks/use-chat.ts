import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { chatService, Conversation, Message, User } from '@/services/chat.api';

interface TypingUser {
  userId: number;
  username: string;
  conversationId: number;
}

export const useChat = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<{ [conversationId: number]: Message[] }>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const typingTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize socket connection only when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clean up if not authenticated
      chatService.removeAllListeners();
      chatService.disconnect();
      setConnected(false);
      setConversations([]);
      setCurrentMessages({});
      setNotifications([]);
      setSelectedConversation(null);
      return;
    }

    const initializeChat = async () => {
      try {
        // Connect to socket (synchronous now since we're using cookies)
        const socket = chatService.connect();
        
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
          // You might want to show a toast notification here
        });
        
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setConnectionError('Failed to initialize chat');
      }
    };

    initializeChat();

    return () => {
      chatService.removeAllListeners();
      chatService.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  // Load initial data when connected and authenticated
  useEffect(() => {
    if (connected && isAuthenticated) {
      loadConversations();
      loadNotifications();
    }
  }, [connected, isAuthenticated]);

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
    
    // Update conversation's last message and move to top
    setConversations(prev => {
      const updatedConversations = prev.map(conv => 
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
      return updatedConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }, []);

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
      setConversations(prev => 
        prev.map(conv => 
          conv.id === data.conversationId 
            ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - data.messageIds.length) }
            : conv
        )
      );
    }
  }, []);

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
  setNotifications(prev => {
    // Check if this notification already exists
    const existingIndex = prev.findIndex(n => n.id === notification.id);
    if (existingIndex !== -1) {
      // Update existing notification (in case it was modified)
      const updated = [...prev];
      updated[existingIndex] = notification;
      return updated;
    }
    // Add new notification at the beginning
    return [notification, ...prev];
  });
  
  if (!notification.isRead) {
    setUnreadNotificationCount(prev => {
      // Make sure we don't double-count if notification already existed
      const existingNotification = notifications.find(n => n.id === notification.id);
      if (existingNotification && !existingNotification.isRead) {
        return prev; // Don't increment if we're just updating an existing unread notification
      }
      return prev + 1;
    });
  }

  // Show browser notification if permission granted
  if (Notification.permission === 'granted' && notification.type === 'NEW_MESSAGE') {
    new Notification(notification.title, {
      body: notification.content,
      icon: '/favicon.ico', // Update with your app icon
    });
  }
}, [notifications]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations(1, 20);
      if (response.success) {
        setConversations(response.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number, page = 1) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await chatService.getNotifications(1, 20);
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadNotificationCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
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
          // Only add to state if it's truly new
          setConversations(prev => {
            // Double check to avoid race conditions
            if (prev.some(conv => conv.id === response.conversation.id)) {
              return prev;
            }
            return [response.conversation, ...prev];
          });
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
      if (markAll) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadNotificationCount(0);
      } else if (notificationIds) {
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n.id) ? { ...n, isRead: true } : n
          )
        );
        // Only decrement count for notifications that were actually unread
        const actuallyMarked = notifications.filter(n => 
          notificationIds.includes(n.id) && !n.isRead
        ).length;
        setUnreadNotificationCount(prev => Math.max(0, prev - actuallyMarked));
      }
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
    loadConversations,
    loadMessages,
    loadNotifications,
    createConversation,
    sendMessage,
    markMessagesAsRead,
    markNotificationsAsRead,
    searchUsers,
    startTyping,
    stopTyping,
    selectConversation,
    
    // Helpers
    getCurrentUserId,
    hasUserReadMessage,
    getConversationName,
    getTypingUsersInConversation,
  };
};