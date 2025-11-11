"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MessageSquare } from "lucide-react"
import type { Card as CardType } from "@/types/board"

interface CardProps {
  card: CardType
  onClick?: () => void
  isDragging?: boolean
}

export function Card({ card, onClick, isDragging = false }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`border border-border rounded-lg p-4 bg-card hover:bg-card/80 hover:border-primary/50 transition-all duration-300 cursor-pointer group ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">{card.title}</h4>

      {card.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{card.description}</p>}

      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {card.labels.map((label) => (
            <span key={label} className="text-xs px-2 py-1 rounded bg-primary/10 text-foreground">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {card.assignees.map((assignee) => (
            <div
              key={assignee}
              className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center"
            >
              <span className="text-xs font-semibold">{assignee}</span>
            </div>
          ))}
        </div>

        {card.comments > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">{card.comments}</span>
          </div>
        )}
      </div>
    </div>
  )
}
