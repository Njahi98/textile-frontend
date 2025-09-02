import { useEffect, useState } from 'react'
import { Check, X, Loader2, Users } from 'lucide-react'
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

interface Props  {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateConversation: (participantIds: number[], name?: string, isGroup?: boolean) => Promise<void>
  searchUsers: (query: string) => Promise<User[]>
}

export function NewChat({ onOpenChange, open, onCreateConversation, searchUsers }: Props) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Handle user search
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        try {
          const users = await searchUsers(searchQuery.trim())
          setSearchResults(users)
        } catch (error) {
          console.error('Search failed:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300) // Debounce search

    return () => clearTimeout(searchTimeout)
  }, [searchQuery, searchUsers])

  // Auto-enable group mode when multiple users are selected
  useEffect(() => {
    if (selectedUsers.length > 1 && !isGroup) {
      setIsGroup(true)
    }
  }, [selectedUsers.length, isGroup])

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    } else {
      handleRemoveUser(user.id)
    }
  }

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return

    setIsCreating(true)
    try {
      const participantIds = selectedUsers.map(user => user.id)
      const conversationName = isGroup ? groupName.trim() || undefined : undefined
      
      await onCreateConversation(participantIds, conversationName, isGroup)
      
      // Reset form
      setSelectedUsers([])
      setSearchResults([])
      setSearchQuery('')
      setIsGroup(false)
      setGroupName('')
    } catch (error) {
      console.error('Failed to create conversation:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedUsers([])
      setSearchResults([])
      setSearchQuery('')
      setIsGroup(false)
      setGroupName('')
      setIsCreating(false)
    }
  }, [open])

  const getUserDisplayName = (user: User) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    return fullName || user.username
  }

  const canCreateConversation = selectedUsers.length > 0 && (!isGroup || groupName.trim().length > 0 || selectedUsers.length === 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        
        <div className='flex flex-col gap-4'>
          {/* Selected Users */}
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-muted-foreground text-sm'>To:</span>
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant='default' className="flex items-center gap-1">
                {getUserDisplayName(user)}
                <button
                  className='ring-offset-background focus:ring-ring ml-1 rounded-full outline-hidden focus:ring-2 focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRemoveUser(user.id)
                    }
                  }}
                  onClick={() => handleRemoveUser(user.id)}
                  type="button"
                >
                  <X className='text-muted-foreground hover:text-foreground h-3 w-3' />
                </button>
              </Badge>
            ))}
            {selectedUsers.length === 0 && (
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
                <Label htmlFor="group-mode" className="flex items-center gap-2">
                  <Users size={16} />
                  Group conversation
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
                  />
                </div>
              )}
            </div>
          )}

          {/* User Search */}
          <Command className='rounded-lg border'>
            <CommandInput
              placeholder='Search people...'
              className='text-foreground'
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isSearching ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : searchQuery.length < 2 ? (
                <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
              ) : searchResults.length === 0 ? (
                <CommandEmpty>No users found</CommandEmpty>
              ) : (
                <CommandGroup>
                  {searchResults.map((user) => {
                    const isSelected = selectedUsers.find((u) => u.id === user.id)
                    const displayName = getUserDisplayName(user)
                    return (
                      <CommandItem
                        key={user.id}
                        onSelect={() => handleSelectUser(user)}
                        value={`${displayName} @${user.username}`}
                        className='flex items-center justify-between gap-2 cursor-pointer'
                      >
                        <div className='flex items-center gap-2'>
                            <Avatar>
                              <AvatarImage src={user?.avatarUrl} alt="userAvatar" />
                              <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
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
                          <Check className='h-4 w-4 text-primary' />
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>

          {/* Create Button */}
          <Button
            onClick={handleCreateConversation}
            disabled={!canCreateConversation || isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {isGroup ? 'Create Group' : 'Start Chat'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}