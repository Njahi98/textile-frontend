import { useState, useCallback, useMemo } from 'react';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '../hooks/use-chat';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '@/services/chat.api';

const NotificationTypeIcon = ({ type }: { type: string }) => {
  const iconMap = {
    NEW_MESSAGE: 'bg-blue-500',
    PERFORMANCE_ALERT: 'bg-red-500',
    SYSTEM: 'bg-green-500',
    MENTION: 'bg-purple-500',
  } as const;

  const colorClass = iconMap[type as keyof typeof iconMap] || 'bg-gray-500';

  return <div className={`w-2 h-2 rounded-full ${colorClass}`} />;
};

const formatNotificationTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  } catch {
    return 'some time ago';
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onNavigate: () => void;
}

const NotificationItem = ({ notification, onMarkRead, onNavigate }: NotificationItemProps) => {
  const handleClick = useCallback(() => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    onNavigate();
  }, [notification.id, notification.isRead, onMarkRead, onNavigate]);

  const handleMarkReadClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMarkRead(notification.id);
    },
    [notification.id, onMarkRead]
  );

  return (
    <DropdownMenuItem
      className={cn(
        'flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors',
        !notification.isRead && 'bg-muted/30'
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-1">
        <NotificationTypeIcon type={notification.type} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p
            className={cn(
              'text-sm font-medium truncate',
              !notification.isRead && 'font-semibold'
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-2 opacity-60 hover:opacity-100 transition-opacity"
              onClick={handleMarkReadClick}
              aria-label="Mark as read"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
        </div>

        <p
          className={cn(
            'text-xs text-muted-foreground line-clamp-2',
            !notification.isRead && 'text-foreground'
          )}
        >
          {notification.content}
        </p>

        <p className="text-xs text-muted-foreground mt-1">
          {formatNotificationTime(notification.createdAt)}
        </p>
      </div>
    </DropdownMenuItem>
  );
};

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markingIndividual, setMarkingIndividual] = useState<Set<number>>(new Set());

  const navigate = useNavigate();

  const { notifications, unreadNotificationCount, markNotificationsAsRead, loading, connected } =
    useChat();

  // Memoized unique recent notifications to prevent unnecessary re-renders
  const recentNotifications = useMemo(() => {
    const uniqueNotifications = notifications.reduce((acc, current) => {
      const existingIndex = acc.findIndex((item) => item.id === current.id);
      if (existingIndex === -1) {
        acc.push(current);
      } else {
        acc[existingIndex] = current;
      }
      return acc;
    }, [] as Notification[]);

    return uniqueNotifications.slice(0, 50);
  }, [notifications]);

  const handleMarkAllRead = useCallback(async () => {
    if (unreadNotificationCount === 0 || markingAllRead) return;

    setMarkingAllRead(true);
    try {
      await markNotificationsAsRead(undefined, true);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  }, [unreadNotificationCount, markingAllRead, markNotificationsAsRead]);

  const handleMarkSingleRead = useCallback(
    async (notificationId: number) => {
      if (markingIndividual.has(notificationId)) return;

      setMarkingIndividual((prev) => new Set(prev).add(notificationId));
      try {
        await markNotificationsAsRead([notificationId]);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      } finally {
        setMarkingIndividual((prev) => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    },
    [markingIndividual, markNotificationsAsRead]
  );

  const handleNavigateToChat = useCallback(() => {
    navigate('/chat');
    setIsOpen(false);
  }, [navigate]);

  const hasUnreadNotifications = unreadNotificationCount > 0;
  const hasNotifications = recentNotifications.length > 0;
  const showOfflineBadge = !connected;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-muted/50 transition-colors"
          aria-label={`Notifications${hasUnreadNotifications ? ` (${unreadNotificationCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-[400px] flex flex-col">
        <DropdownMenuLabel className="flex items-center justify-between py-3 shrink-0">
          <span className="font-semibold">Notifications</span>
          <div className="flex items-center gap-2">
            {showOfflineBadge && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                Offline
              </Badge>
            )}
            {hasUnreadNotifications && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className="h-6 px-2 text-xs hover:bg-muted transition-colors"
                aria-label="Mark all notifications as read"
              >
                {markingAllRead ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </>
                )}
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="shrink-0" />

        {loading && !hasNotifications ? (
          <div className="flex justify-center items-center py-8 flex-1">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading notifications...</span>
          </div>
        ) : !hasNotifications ? (
          <div className="text-center py-8 px-4 flex-1">
            <div className="text-muted-foreground text-sm mb-2">No notifications yet</div>
            <div className="text-xs text-muted-foreground">
              You'll see new messages and updates here
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="max-h-[300px] overflow-y-auto">
              <div className="py-1">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={`notification-${notification.id}`}
                    notification={notification}
                    onMarkRead={handleMarkSingleRead}
                    onNavigate={handleNavigateToChat}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {hasNotifications && (
          <>
            <DropdownMenuSeparator className="shrink-0" />
            <div className="px-3 py-2 text-center shrink-0">
              <span className="text-xs text-muted-foreground">
                Showing {Math.min(recentNotifications.length, 50)} recent notifications
              </span>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}