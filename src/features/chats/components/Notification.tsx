import { useState } from 'react'
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from '../hooks/use-chat'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

const NotificationTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'NEW_MESSAGE':
      return <div className="w-2 h-2 bg-blue-500 rounded-full" />
    case 'PERFORMANCE_ALERT':
      return <div className="w-2 h-2 bg-red-500 rounded-full" />
    case 'SYSTEM':
      return <div className="w-2 h-2 bg-green-500 rounded-full" />
    case 'MENTION':
      return <div className="w-2 h-2 bg-purple-500 rounded-full" />
    default:
      return <div className="w-2 h-2 bg-gray-500 rounded-full" />
  }
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [markingRead, setMarkingRead] = useState(false)

  const navigate = useNavigate();
  
  const {
    notifications,
    unreadNotificationCount,
    markNotificationsAsRead,
    loading,
    connected
  } = useChat()

  const handleMarkAllRead = async () => {
    if (unreadNotificationCount === 0) return
    
    setMarkingRead(true)
    try {
      await markNotificationsAsRead(undefined, true)
    } finally {
      setMarkingRead(false)
    }
  }

  const handleMarkSingleRead = async (notificationId: number) => {
    await markNotificationsAsRead([notificationId])
  }

  const formatNotificationTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours}h ago`
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d ago`
      
      return date.toLocaleDateString()
    } catch {
      return 'some time ago'
    }
  }

  const getNotificationIcon = (type: string) => {
    return <NotificationTypeIcon type={type} />
  }

  // Remove duplicates and show only recent notifications (last 50)
  const uniqueNotifications = notifications.reduce((acc, current) => {
    const existingIndex = acc.findIndex(item => item.id === current.id)
    if (existingIndex === -1) {
      acc.push(current)
    } else {
      // Keep the most recent version (in case of updates)
      acc[existingIndex] = current
    }
    return acc
  }, [] as typeof notifications)
  
  const recentNotifications = uniqueNotifications.slice(0, 50)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            {!connected && (
              <Badge variant="outline" className="text-xs">
                Offline
              </Badge>
            )}
            {unreadNotificationCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markingRead}
                className="h-6 px-2 text-xs"
              >
                {markingRead ? (
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
        
        <DropdownMenuSeparator />
        
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="h-96">
            {recentNotifications.map((notification, index) => (
              <DropdownMenuItem
                key={`notification-${notification.id}-${index}`} // More unique key
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer",
                  !notification.isRead && "bg-muted/30"
                )}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkSingleRead(notification.id)
                  }
                  navigate("/chat");
                }}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      !notification.isRead && "font-semibold"
                    )}>
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkSingleRead(notification.id)
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-xs text-muted-foreground line-clamp-2",
                    !notification.isRead && "text-foreground"
                  )}>
                    {notification.content}
                  </p>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNotificationTime(notification.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        {recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center text-sm text-muted-foreground cursor-default"
              onSelect={(e) => e.preventDefault()}
            >
              Showing recent notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}