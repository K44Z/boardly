"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card } from "./card"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal } from "lucide-react"
import type { Column as ColumnType, Card as CardType } from "@/types/board"

interface ColumnProps {
  column: ColumnType
  onAddCard: (columnId: string) => void
  onCardClick: (card: CardType) => void
}

export function Column({ column, onAddCard, onCardClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex-shrink-0 w-80 animate-fade-in">
      <div className="border border-border rounded-lg bg-card/50 backdrop-blur-sm">
        {/* Column Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">{column.title}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{column.cards.length}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Cards Container */}
        <div ref={setNodeRef} className="p-4 space-y-3 min-h-[200px]">
          <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {column.cards.map((card) => (
              <Card key={card.id} card={card} onClick={() => onCardClick(card)} />
            ))}
          </SortableContext>

          {/* Add Card Button */}
          <button
            onClick={() => onAddCard(column.id)}
            className="w-full border border-dashed border-border rounded-lg p-3 bg-background/50 hover:bg-background hover:border-primary/50 transition-all duration-300 flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Add card
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
