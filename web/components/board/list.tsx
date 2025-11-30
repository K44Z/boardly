"use client"

import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { Card } from "./card"
import type { List as ListType, Card as CardType } from "@/types/types"

interface ListProps {
  list: ListType
  onAddCard: (listId: number) => void
  onCardClick: (card: CardType) => void
  onAssignUser?: (cardId: number, userId: number) => void
  onUnassignUser?: (cardId: number, userId: number) => void
}

export function List({ list, onAddCard, onCardClick, onAssignUser, onUnassignUser }: ListProps) {
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{list.name}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {list.cards.length}
          </span>
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
