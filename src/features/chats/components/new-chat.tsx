import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Check, X, Loader2, Users, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { User } from '@/services/chat.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import useSWR from 'swr'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateConversation: (participantIds: number[], name?: string, isGroup?: boolean) => Promise<void>
  searchUsers: (query: string) => Promise<User[]>
}

interface SearchError {
  message: string
  retry: () => void
}

// Custom hook for debounced search with SWR integration
function useUserSearch(query: string, searchUsers: (query: string) => Promise<User[]>) {
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query])

  const shouldFetch = debouncedQuery.length >= 2

  const { data: searchResults = [], error, isLoading, mutate } = useSWR(
    shouldFetch ? `user-search-${debouncedQuery}` : null,
    () => searchUsers(debouncedQuery),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    }
  )

  const retrySearch = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    searchResults,
    isSearching: isLoading,
    searchError: error ? { message: error.message || 'Search failed', retry: retrySearch } : null,
    hasSearchQuery: shouldFetch
  }
}

// Memoized user item component to prevent unnecessary re-renders
const UserItem = ({ 
  user, 
  isSelected, 
  onSelect 
}: { 
  user: User
  isSelected: boolean
  onSelect: (user: User) => void
}) => {
  const displayName = useMemo(() => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    return fullName || user.username
  }, [user.firstName, user.lastName, user.username])

  const handleSelect = useCallback(() => {
    onSelect(user)
  }, [user, onSelect])

  const avatarFallback = useMemo(() => {
    return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }, [displayName])

  return (
    <CommandItem
      key={user.id}
      onSelect={handleSelect}
      value={`${displayName} @${user.username}`}
      className='flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 transition-colors'
    >
      <div className='flex items-center gap-3'>
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.avatarUrl || undefined} alt={`${displayName}'s avatar`} />
          <AvatarFallback className="text-xs">{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col'>
          <span className='text-sm font-medium'>
            {displayName}
          </span>
          <span className='text-muted-foreground text-xs'>
            @{user.username}
          </span>
        </div>
      </div>

      {isSelected && (
        <Check className='h-4 w-4 text-primary flex-shrink-0' />
      )}
    </CommandItem>
  )
}

// Memoized selected user badge
const SelectedUserBadge = ({ 
  user, 
  onRemove 
}: { 
  user: User
  onRemove: (userId: number) => void 
}) => {
  const displayName = useMemo(() => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    return fullName || user.username
  }, [user.firstName, user.lastName, user.username])

  const handleRemove = useCallback(() => {
    onRemove(user.id)
  }, [user.id, onRemove])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleRemove()
    }
  }, [handleRemove])

  return (
    <Badge key={user.id} variant='default' className="flex items-center gap-1 pr-1">
      {displayName}
      <button
        className='ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2 hover:bg-black/10 p-0.5 transition-colors'
        onKeyDown={handleKeyDown}
        onClick={handleRemove}
        type="button"
        aria-label={`Remove ${displayName}`}
      >
        <X className='text-muted-foreground hover:text-foreground h-3 w-3' />
      </button>
    </Badge>
  )
}

export function NewChat({ onOpenChange, open, onCreateConversation, searchUsers }: Props) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const { searchResults, isSearching, searchError, hasSearchQuery } = useUserSearch(searchQuery, searchUsers)

  // Auto-enable group mode when multiple users are selected
  useEffect(() => {
    if (selectedUsers.length > 1 && !isGroup) {
      setIsGroup(true)
    }
  }, [selectedUsers.length, isGroup])

  // Memoized handlers to prevent unnecessary re-renders
  const handleSelectUser = useCallback((user: User) => {
    setSelectedUsers(prev => {
      const isAlreadySelected = prev.find((u) => u.id === user.id)
      if (isAlreadySelected) {
        return prev.filter((u) => u.id !== user.id)
      } else {
        return [...prev, user]
      }
    })
  }, [])

  const handleRemoveUser = useCallback((userId: number) => {
    setSelectedUsers(prev => prev.filter((user) => user.id !== userId))
  }, [])

  const handleCreateConversation = useCallback(async () => {
    if (selectedUsers.length === 0) return

    setIsCreating(true)
    setCreateError(null)
    
    try {
      const participantIds = selectedUsers.map(user => user.id)
      const conversationName = isGroup ? groupName.trim() || undefined : undefined
      
      await onCreateConversation(participantIds, conversationName, isGroup)
            
      onOpenChange(false)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation'
      setCreateError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }, [selectedUsers, isGroup, groupName, onCreateConversation, onOpenChange])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCreateError(null)
    } else {
      setSelectedUsers([])
      setSearchQuery('')
      setIsGroup(false)
      setGroupName('')
      setIsCreating(false)
      setCreateError(null)
    }
  }, [open])

  // Memoized validation
  const canCreateConversation = useMemo(() => {
    if (selectedUsers.length === 0) return false
    if (isGroup && selectedUsers.length > 1) {
      return groupName.trim().length > 0
    }
    return true
  }, [selectedUsers.length, isGroup, groupName])

  // Memoized selected user map for performance
  const selectedUserIds = useMemo(() => 
    new Set(selectedUsers.map(u => u.id)), 
    [selectedUsers]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        
        <div className='flex flex-col gap-4 flex-1 overflow-hidden'>
          {/* Create Error Alert */}
          {createError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          {/* Selected Users */}
          <div className='flex flex-wrap items-center gap-2 min-h-[2rem]'>
            <span className='text-muted-foreground text-sm flex-shrink-0'>To:</span>
            {selectedUsers.length > 0 ? (
              selectedUsers.map((user) => (
                <SelectedUserBadge
                  key={user.id}
                  user={user}
                  onRemove={handleRemoveUser}
                />
              ))
            ) : (
              <span className="text-muted-foreground text-sm italic">
                Search for users to start a conversation
              </span>
            )}
          </div>

          {/* Group Settings */}
          {selectedUsers.length > 0 && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  id="group-mode"
                  checked={isGroup}
                  onCheckedChange={setIsGroup}
                  disabled={selectedUsers.length > 1} // Force group mode for multiple users
                />
                <Label htmlFor="group-mode" className="flex items-center gap-2 cursor-pointer">
                  <Users size={16} />
                  Group conversation
                  {selectedUsers.length > 1 && (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  )}
                </Label>
              </div>
              
              {isGroup && (
                <div className="space-y-2">
                  <Label htmlFor="group-name" className="text-sm">
                    Group name {selectedUsers.length > 1 && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="group-name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="h-9"
                    maxLength={50}
                  />
                  {groupName.length > 40 && (
                    <p className="text-xs text-muted-foreground">
                      {50 - groupName.length} characters remaining
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Search */}
          <div className="flex-1 overflow-hidden">
            <Command className='rounded-lg border h-full flex flex-col'>
              <CommandInput
                placeholder='Search people...'
                className='text-foreground'
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList className="flex-1 overflow-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : searchError ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        {searchError.message}
                        <Button variant="outline" size="sm" onClick={searchError.retry}>
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : !hasSearchQuery ? (
                  <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
                ) : searchResults.length === 0 ? (
                  <CommandEmpty>No users found</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {searchResults.map((user) => (
                      <UserItem
                        key={user.id}
                        user={user}
                        isSelected={selectedUserIds.has(user.id)}
                        onSelect={handleSelectUser}
                      />
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreateConversation}
            disabled={!canCreateConversation || isCreating}
            className="w-full"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {isGroup ? 'Create Group' : 'Start Chat'}
                {selectedUsers.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}