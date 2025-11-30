"use client"

import { useState, useEffect } from "react"
import { UserPlus, Check, Loader2, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { api, type User, type Card } from "@/lib/api"
import Image from "next/image"

interface AssigneeDropdownProps {
  card: Card
  onAssignUser?: (userId: number) => void
  onUnassignUser?: (userId: number) => void
}

export function AssigneeDropdown({ card, onAssignUser, onUnassignUser }: AssigneeDropdownProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open, searchQuery])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await api.searchUsers(searchQuery)
      if (response.data?.users) {
        setUsers(response.data.users)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const isAssigned = (userId: number) => {
    return card.assignees?.some(assignee => assignee.id === userId) || false
  }

  const handleToggleAssignee = (user: User) => {
    if (isAssigned(user.id)) {
      onUnassignUser?.(user.id)
    } else {
      onAssignUser?.(user.id)
    }
  }

  const handleRemoveAssignee = (userId: number) => {
    onUnassignUser?.(userId)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="w-7 h-7 rounded-full border-2 border-dashed border-border/50 hover:border-primary/50 flex items-center justify-center transition-all hover:scale-110 ml-1"
          onClick={(e) => e.stopPropagation()}
        >
          <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 p-0" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b">
          <h4 className="font-semibold text-sm mb-2">Assign members</h4>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Current Assignees */}
        {card.assignees && card.assignees.length > 0 && (
          <>
            <div className="p-2 max-h-32 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                Assigned ({card.assignees.length})
              </p>
              {card.assignees.map((assignee) => (
                <DropdownMenuItem
                  key={assignee.id}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleRemoveAssignee(assignee.id)}
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    {assignee.profile_image ? (
                      <Image
                        src={assignee.profile_image}
                        alt={assignee.username}
                        fill
                        className="object-cover"
                        sizes="24px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {assignee.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{assignee.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{assignee.email}</p>
                  </div>
                  <Check className="w-4 h-4 text-primary" />
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Available Users */}
        <div className="p-2 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : users.length > 0 ? (
            <>
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                Available users
              </p>
              {users
                .filter(user => !isAssigned(user.id))
                .map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleToggleAssignee(user)}
                  >
                    <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      {user.profile_image ? (
                        <Image
                          src={user.profile_image}
                          alt={user.username}
                          fill
                          className="object-cover"
                          sizes="24px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users found
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
