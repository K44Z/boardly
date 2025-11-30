"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, MessageSquare, Paperclip, AlertCircle, UserPlus } from "lucide-react"
import type { Card as CardType } from "@/types/types"
import Image from "next/image"
import { AssigneeDropdown } from "./assignee-dropdown"

interface CardProps {
  card: CardType
  onClick?: () => void
  isDragging?: boolean
  onAssignUser?: (userId: number) => void
  onUnassignUser?: (userId: number) => void
}

export function Card({ card, onClick, isDragging = false, onAssignUser, onUnassignUser }: CardProps) {
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

  const isDueSoon = card.due_date && new Date(card.due_date) < new Date(Date.now() + 24 * 60 * 60 * 1000);
  const isOverdue = card.due_date && new Date(card.due_date) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        relative overflow-hidden
        border border-border/50 rounded-xl p-4 
        bg-gradient-to-br from-card to-card/50
        hover:from-card hover:to-card/80
        hover:border-primary/40
        hover:shadow-xl hover:shadow-primary/5
        transition-all duration-300 
        cursor-pointer group
        backdrop-blur-sm
        ${isDragging ? "shadow-2xl shadow-primary/20 scale-105 rotate-2" : ""}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative z-10">
        <h4 className="font-semibold text-base mb-3 group-hover:text-primary transition-colors duration-200 leading-snug">
          {card.title}
        </h4>
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: label.color,
                  boxShadow: `0 2px 8px ${label.color}33`
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Due date with warning states */}
        {card.due_date && (
          <div className={`
            flex items-center gap-1.5 mb-3 px-2 py-1 rounded-md text-xs w-fit
            ${isOverdue 
              ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
              : isDueSoon 
                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                : 'bg-muted/50 text-muted-foreground'
            }
          `}>
            {isOverdue && <AlertCircle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            <span className="font-medium">
              {new Date(card.due_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          {/* Assignees with profile images */}
          <div className="flex -space-x-2 items-center" onClick={(e) => e.stopPropagation()}>
            {card.assignees && card.assignees.length > 0 ? (
              <>
                {card.assignees.slice(0, 3).map((assignee) => (
                  <div
                    key={assignee.id}
                    className="relative w-7 h-7 rounded-full border-2 border-card shadow-sm transition-transform hover:scale-110 hover:z-10 overflow-hidden group/avatar"
                    title={assignee.username}
                  >
                    {assignee.profile_image ? (
                      <Image
                        src={assignee.profile_image}
                        alt={assignee.username}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {assignee.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {card.assignees.length > 3 && (
                  <div
                    className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center shadow-sm"
                    title={`${card.assignees.length - 3} more`}
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      +{card.assignees.length - 3}
                    </span>
                  </div>
                )}
              </>
            ) : null}
            
            {/* Add Assignee Button */}
            <AssigneeDropdown
              card={card}
              onAssignUser={onAssignUser}
              onUnassignUser={onUnassignUser}
            />
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-2">
            {/* Uncomment when attachments are added */}
            {/* <div className="flex items-center gap-1 text-muted-foreground/70 hover:text-foreground transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">2</span>
            </div> */}
            
            {/* Uncomment when comments are added to Card type */}
            {/* {card.comments && card.comments > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground/70 hover:text-foreground transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{card.comments}</span>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  )
}
