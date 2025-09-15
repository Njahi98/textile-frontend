import { useState, useEffect, useRef } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format, isToday, isYesterday } from 'date-fns'
import {
  ArrowLeft,
  SquarePen,
  MessagesSquare,
  Paperclip,
  Image,
  Search,
  Send,
  Loader2,
  RefreshCw,
  WifiOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { NewChat } from './components/new-chat'
import { useChat } from './hooks/use-chat'
import { Message, Conversation } from '@/services/chat.api'
import { toast } from 'sonner'

export default function Chats() {
  const [search, setSearch] = useState('')
  const [mobileSelectedUser, setMobileSelectedUser] = useState<Conversation | null>(null)
  const [createConversationDialogOpened, setCreateConversationDialog] = useState(false)
  const [messageInput, setMessageInput] = useState('')

  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const messageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const {
    conversations,
    currentMessages,
    loading,
    connected,
    selectedConversation,
    messagesEndRef,
    connectionError,
    selectConversation,
    sendMessage,
    searchUsers,
    createConversation,
    getConversationName,
    getTypingUsersInConversation,
    getCurrentUserId,
    startTyping,
    stopTyping,
    uploadFile,
    hasUserReadMessage,
    refreshConversations,
    refreshNotifications,
  } = useChat()

  // Filtered conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    getConversationName(conv).toLowerCase().includes(search.trim().toLowerCase())
  )

  // Get current conversation messages
  const currentConversationMessages = selectedConversation 
    ? currentMessages[selectedConversation.id] || []
    : []

  // Group messages by date
  const groupedMessages = currentConversationMessages.reduce((acc: Record<string, Message[]>, message) => {
    const messageDate = new Date(message.createdAt)
    let dateKey: string
    
    if (isToday(messageDate)) {
      dateKey = 'Today'
    } else if (isYesterday(messageDate)) {
      dateKey = 'Yesterday'
    } else {
      dateKey = format(messageDate, 'd MMM, yyyy')
    }

    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(message)
    return acc
  }, {})

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedConversation) return

    const content = messageInput.trim()
    setMessageInput('')
    
    await sendMessage(selectedConversation.id, content)
    stopTyping(selectedConversation.id)
  }

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)
    
    if (!selectedConversation) return
    
    // Start typing indicator
    startTyping(selectedConversation.id)
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversation.id)
    }, 1000)
  }

  // Clean up typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Handle conversation creation
  const handleCreateConversation = async (participantIds: number[], name?: string, isGroup = false) => {
    // Before creating, check if a direct conversation already exists locally
    if (!isGroup && participantIds.length === 1) {
      const otherUserId = participantIds[0];
      const currentUserId = getCurrentUserId();
      const existingConversation = conversations.find(conv => 
        !conv.isGroup && 
        conv.participants.length === 2 &&
        conv.participants.some(p => p.userId === otherUserId) &&
        conv.participants.some(p => p.userId === currentUserId)
      );

      if (existingConversation) {
        setCreateConversationDialog(false);
        await selectConversation(existingConversation);
        setMobileSelectedUser(existingConversation);
        return;
      }
    }

    // Proceed with creating/finding the conversation
    const conversation = await createConversation(participantIds, name, isGroup);
    if (conversation) {
      setCreateConversationDialog(false);
      await selectConversation(conversation);
      setMobileSelectedUser(conversation);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await Promise.all([
        refreshConversations(),
        refreshNotifications()
      ]);
      toast.success('Chat data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a')
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const currentUserId = getCurrentUserId()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !selectedConversation || !connected) return
    
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
          continue
        }
        await uploadFile(selectedConversation.id, file)
      }
    } catch (error) {
      console.error('File upload failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'File upload failed. Please try again.'
      toast.error(`File upload failed: ${errorMessage}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderMessageContent = (message: Message) => {
    switch (message.messageType) {
      case 'IMAGE':
        return (
          <div className="space-y-2">
            <img 
              src={message.fileUrl || ''} 
              alt={message.fileName || 'Image'}
              className="max-w-full h-auto rounded-md cursor-pointer"
              onClick={() => message.fileUrl && window.open(message.fileUrl, '_blank')}
            />
            {message.fileName && (
              <p className="text-xs opacity-75">{message.fileName}</p>
            )}
          </div>
        )
      
      case 'VIDEO':
        return (
          <div className="space-y-2">
            <video 
              src={message.fileUrl || ''} 
              controls
              className="max-w-full h-auto rounded-md"
              style={{ maxHeight: '300px' }}
            />
            {message.fileName && (
              <p className="text-xs opacity-75">{message.fileName}</p>
            )}
          </div>
        )
      
      case 'FILE':
        return (
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-md">
            <Paperclip size={20} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{message.fileName || 'Unknown file'}</p>
              {message.fileSize && (
                <p className="text-xs text-muted-foreground">{formatFileSize(message.fileSize)}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => message.fileUrl && window.open(message.fileUrl, '_blank')}
            >
              Download
            </Button>
          </div>
        )
      
      default:
        return <div className="text-sm">{message.content}</div>
    }
  }

  return (
    <>
      <Main fixed>
        {/* Connection Error Alert */}
        {connectionError && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Connection failed: {connectionError}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <section className='flex h-full gap-6'>
          {/* Left Side - Conversation List */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2 items-center'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
                  <MessagesSquare size={20} />
                  {!connected && (
                    <Badge variant="destructive" className="text-xs">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                  {connected && (
                    <Badge variant="secondary" className="text-xs">
                      Online
                    </Badge>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={handleRefresh}
                    className='rounded-lg'
                    disabled={loading}
                  >
                    <RefreshCw size={18} className={cn('stroke-muted-foreground', loading && 'animate-spin')} />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setCreateConversationDialog(true)}
                    className='rounded-lg'
                    disabled={!connected}
                  >
                    <SquarePen size={20} className='stroke-muted-foreground' />
                  </Button>
                </div>
              </div>

              <label className='border-input focus-within:ring-ring flex h-12 w-full items-center space-x-0 rounded-md border pl-2 focus-within:ring-1 focus-within:outline-hidden'>
                <Search size={15} className='mr-2 stroke-slate-500' />
                <span className='sr-only'>Search</span>
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                  placeholder='Search conversations...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            <ScrollArea className='-mx-3 h-full p-3'>
              {loading && conversations.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {search ? 'No conversations found' : 'No conversations yet'}
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const conversationName = getConversationName(conversation)
                  const lastMessage = conversation.lastMessage
                  const hasUnread = conversation.unreadCount > 0
                  const messagerAvatarUrl = conversation.participants.find(p => p.userId !== currentUserId)?.user.avatarUrl                  
                  let lastMessageText = ''
                  if (lastMessage) {
                    const isOwnMessage = lastMessage.senderId === currentUserId
                    const prefix = isOwnMessage ? 'You: ' : ''

                    switch(lastMessage.messageType) {
                      case 'TEXT':
                        lastMessageText = `${prefix}${lastMessage.content}`
                        break
                      case 'IMAGE':
                        lastMessageText = `${prefix}sent an image`
                        break
                      case 'VIDEO':
                        lastMessageText = `${prefix}sent a video`
                        break
                      case 'FILE':
                        lastMessageText = `${prefix}sent a file`
                        break
                      default:
                        lastMessageText = `${prefix}${lastMessage.content}`
                    }
                  }
                  return (
                    <Fragment key={conversation.id}>
                      <button
                        type='button'
                        className={cn(
                          `hover:bg-secondary/75 -mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm relative`,
                          selectedConversation?.id === conversation.id && 'sm:bg-muted'
                        )}
                        onClick={() => {
                          selectConversation(conversation)
                          setMobileSelectedUser(conversation)
                        }}
                      >
                        <div className='flex gap-2 flex-1'>
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={messagerAvatarUrl} alt="userAvatar" />
                              <AvatarFallback>{getInitials(conversationName)}</AvatarFallback>
                            </Avatar>
                            {hasUnread && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                'font-medium truncate',
                                hasUnread && 'font-semibold'
                              )}>
                                {conversationName}
                              </span>
                              {lastMessage && (
                                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                  {formatMessageTime(lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                'text-muted-foreground text-sm line-clamp-1 flex-1',
                                hasUnread && 'text-foreground font-medium'
                              )}>
                                {lastMessageText || 'No messages yet'}
                              </span>
                              {hasUnread && conversation.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2 text-xs px-1.5 py-0.5 min-w-0">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      <Separator className='my-1' />
                    </Fragment>
                  )
                })
              )}
            </ScrollArea>
          </div>

          {/* Right Side - Chat Area */}
          {selectedConversation ? (
            <div
              className={cn(
                'bg-primary-foreground absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col rounded-md border shadow-xs transition-all duration-200 sm:static sm:z-auto sm:flex',
                mobileSelectedUser && 'left-0 flex'
              )}
            >
              {/* Chat Header */}
              <div className='bg-secondary mb-1 flex flex-none justify-between rounded-t-md p-4 shadow-lg'>
                <div className='flex gap-3'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='-ml-2 h-full sm:hidden'
                    onClick={() => setMobileSelectedUser(null)}
                  >
                    <ArrowLeft />
                  </Button>
                  <div className='flex items-center gap-2 lg:gap-4'>
                    <Avatar className='size-9 lg:size-11'>
                      <AvatarImage src={selectedConversation.participants.find(p => p.userId !== currentUserId)?.user.avatarUrl} alt="userAvatar" />
                      <AvatarFallback>{getInitials(getConversationName(selectedConversation))}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className='col-start-2 row-span-2 text-sm font-medium lg:text-base'>
                        {getConversationName(selectedConversation)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className='text-muted-foreground col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-xs text-nowrap text-ellipsis lg:max-w-none lg:text-sm'>
                          {selectedConversation.participants.map(p => 
                            `${p.user.firstName ?? ''} ${p.user.lastName ?? ''}`.trim() || p.user.username
                          ).join(', ')}
                        </span>
                        {/* Typing indicator */}
                        {getTypingUsersInConversation(selectedConversation.id).length > 0 && (
                          <span className="text-primary text-xs">
                            typing...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4'>
                <div className='flex size-full flex-1'>
                  <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
                    <ScrollArea className='chat-flex flex h-40 w-full grow flex-col-reverse justify-start gap-4 py-2 pr-4 pb-4'>
                      {loading && currentConversationMessages.length === 0 ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : Object.keys(groupedMessages).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {Object.entries(groupedMessages).map(([dateKey, messages]) => (
                            <Fragment key={`date-${dateKey}`}>
                              {messages.map((message) => {
                                const isOwnMessage = message.senderId === currentUserId
                                const senderName = isOwnMessage 
                                  ? 'You' 
                                  : `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || message.sender.username

                                return (
                                  <div
                                    key={`message-${message.id}`}
                                    className={cn(
                                      'chat-box max-w-72 px-3 py-2 break-words shadow-lg',
                                      isOwnMessage
                                        ? 'bg-primary/85 text-primary-foreground/75 self-end rounded-[16px_16px_0_16px]'
                                        : 'bg-secondary self-start rounded-[16px_16px_16px_0]'
                                    )}
                                  >
                                    {!isOwnMessage && selectedConversation.isGroup && (
                                      <div className="text-xs font-medium mb-1 text-muted-foreground">
                                        {senderName}
                                      </div>
                                    )}
                                    <div className="text-sm">
                                      {renderMessageContent(message)}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                      <span
                                        className={cn(
                                          'text-xs font-light italic',
                                          isOwnMessage ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                        )}
                                      >
                                        {formatMessageTime(message.createdAt)}
                                      </span>
                                      {isOwnMessage && message.readReceipts && message.readReceipts.length > 0 && (
                                        <span className="text-xs text-primary-foreground/60">
                                          ✓✓
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                              <div key={`divider-${dateKey}`} className='text-center text-xs text-muted-foreground py-2'>
                                {dateKey}
                              </div>
                            </Fragment>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className='flex w-full flex-none gap-2'>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.xlsx,.xls,.csv,.pdf,.doc,.docx"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  
                  <div 
                    className={cn(
                      'border-input focus-within:ring-ring flex flex-1 items-center gap-2 rounded-md border px-2 py-1 focus-within:ring-1 focus-within:outline-hidden lg:gap-4',
                      dragOver && 'border-primary bg-primary/5'
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className='space-x-1'>            
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='h-8 rounded-md inline-flex'
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!connected || uploading}
                      >
                        <Image size={20} className='stroke-muted-foreground' />
                      </Button>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='h-8 rounded-md inline-flex'
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!connected || uploading}
                      >
                        <Paperclip size={20} className='stroke-muted-foreground' />
                      </Button>
                    </div>
                    <Input
                      ref={messageInputRef}
                      value={messageInput}
                      onChange={handleInputChange}
                      placeholder={uploading ? 'Uploading file...' : !connected ? 'Connecting...' : 'Type your message...'}
                      className='flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0'
                      disabled={!connected || uploading}
                    />
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Button
                        type="submit"
                        variant='ghost'
                        size='icon'
                        className='hidden sm:inline-flex'
                        disabled={!messageInput.trim() || !connected}
                      >
                        <Send size={20} />
                      </Button>
                    )}
                  </div>
                  <Button 
                    type="submit"
                    className='h-full sm:hidden'
                    disabled={!messageInput.trim() || !connected || uploading}
                  >
                    <Send size={18} /> Send
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className='bg-primary-foreground absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs transition-all duration-200 sm:static sm:z-auto sm:flex'>
              <div className='flex flex-col items-center space-y-6'>
                <div className='border-border flex size-16 items-center justify-center rounded-full border-2'>
                  <MessagesSquare className='size-8' />
                </div>
                <div className='space-y-2 text-center'>
                  <h1 className='text-xl font-semibold'>Your messages</h1>
                  <p className='text-muted-foreground text-sm'>
                    {connected ? 'Send a message to start a chat.' : 'Connecting to chat server...'}
                  </p>
                </div>
                <Button
                  className='bg-blue-500 px-6 text-white hover:bg-blue-600'
                  onClick={() => setCreateConversationDialog(true)}
                  disabled={!connected}
                >
                  Send message
                </Button>
              </div>
            </div>
          )}
        </section>

        <NewChat
          onOpenChange={setCreateConversationDialog}
          open={createConversationDialogOpened}
          onCreateConversation={handleCreateConversation}
          searchUsers={searchUsers}
        />
      </Main>
    </>
  )
}