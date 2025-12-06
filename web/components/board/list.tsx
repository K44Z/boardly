"use client"

import { useDroppable } from "@dnd-kit/core"
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react"
import { Card } from "./card"
import type { List as ListType, Card as CardType } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface ListProps {
  list: ListType
  onAddCard: (listId: number) => void
  onCardClick: (card: CardType) => void
  onAssignUser?: (cardId: number, userId: number) => void
  onUnassignUser?: (cardId: number, userId: number) => void
  isEditingTitle?: boolean
  editingTitle?: string
  onEditTitle?: (name: string) => void
  onSaveTitle?: () => void
  onCancelEdit?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

export function List({ 
  list, 
  onAddCard, 
  onCardClick, 
  onAssignUser, 
  onUnassignUser,
  isEditingTitle = false,
  editingTitle = "",
  onEditTitle,
  onSaveTitle,
  onCancelEdit,
  onEdit,
  onDelete,
  isDeleting = false,
}: ListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  })

  return (
    <div className="flex-shrink-0 w-80">
      <div 
        ref={setNodeRef}
        className={`border border-border rounded-lg p-4 bg-card/50 backdrop-blur-sm flex flex-col h-full max-h-[calc(100vh-200px)] transition-all ${
          isOver ? 'bg-primary/5 border-primary/50 scale-[1.02]' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editingTitle}
                onChange={(e) => onEditTitle?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSaveTitle?.()
                  } else if (e.key === "Escape") {
                    onCancelEdit?.()
                  }
                }}
                className="h-8 text-sm font-semibold"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onSaveTitle}
              >
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onCancelEdit}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {list.name}
                <span className="text-xs text-muted-foreground font-normal">
                  ({list.cards.length})
                </span>
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted transition-colors"
                    disabled={isDeleting}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit list
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete list"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Cards Container */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[200px]">
          {list.cards.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-lg">
              Drop cards here
            </div>
          ) : (
            list.cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onClick={() => onCardClick(card)}
                onAssignUser={(userId) => onAssignUser?.(card.id, userId)}
                onUnassignUser={(userId) => onUnassignUser?.(card.id, userId)}
              />
            ))
          )}
        </div>

        {/* Add Card Button */}
        <button
          onClick={() => onAddCard(list.id)}
          className="mt-3 w-full p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors flex items-center gap-2 justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>
    </div>
  )
}
