"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, AlignLeft, Tag, Users, MessageSquare, Sparkles, ChevronDown, ChevronUp, Trash2, Send } from "lucide-react"
import type { Card as CardType } from "@/types/board"

interface CardModalProps {
  card: CardType
  onClose: () => void
  onUpdate: (card: CardType) => void
  onDelete: () => void
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
}

export function CardModal({ card, onClose, onUpdate, onDelete }: CardModalProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [showAISummary, setShowAISummary] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "JD",
      content: "I've started working on the mockups. Should have something to share by EOD.",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      author: "SM",
      content: "Great! Let me know if you need any feedback on the design direction.",
      timestamp: "1 hour ago",
    },
    {
      id: "3",
      author: "JD",
      content: "Will do! I'm thinking we should go with a minimalist approach.",
      timestamp: "45 minutes ago",
    },
  ])

  const [localCard, setLocalCard] = useState(card)

  const handleGenerateAISummary = async () => {
    setIsGeneratingAI(true)
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGeneratingAI(false)
    setShowAISummary(true)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: "You",
      content: newComment,
      timestamp: "Just now",
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId))
  }

  const handleUpdateTitle = (title: string) => {
    setLocalCard({ ...localCard, title })
    onUpdate({ ...localCard, title })
  }

  const handleUpdateDescription = (description: string) => {
    setLocalCard({ ...localCard, description })
    onUpdate({ ...localCard, description })
  }

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 "
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border rounded-xl bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between z-10">
          <div className="flex-1">
            {isEditingTitle ? (
              <Input
                value={localCard.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                autoFocus
                className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0"
              />
            ) : (
              <h2
                className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {localCard.title}
              </h2>
            )}
            <p className="text-sm text-muted-foreground mt-1">in To Do</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Labels */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Labels</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {localCard.labels.map((label) => (
                <span key={label} className="px-3 py-1 rounded-md bg-primary/10 text-sm font-medium">
                  {label}
                </span>
              ))}
              <Button variant="outline" size="sm" className="h-8 bg-transparent">
                <Tag className="w-3 h-3 mr-2" />
                Add label
              </Button>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Assignees</h3>
            </div>
            <div className="flex items-center gap-3">
              {localCard.assignees.map((assignee) => (
                <div key={assignee} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold">{assignee}</span>
                  </div>
                  <span className="text-sm">{assignee}</span>
                </div>
              ))}
              <Button variant="outline" size="sm" className="h-8 bg-transparent">
                <Users className="w-3 h-3 mr-2" />
                Add assignee
              </Button>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlignLeft className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Description</h3>
            </div>
            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={localCard.description}
                  onChange={(e) => handleUpdateDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  className="min-h-[120px] bg-background"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setIsEditingDescription(false)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setLocalCard({ ...localCard, description: card.description })
                      setIsEditingDescription(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors min-h-[80px]"
                onClick={() => setIsEditingDescription(true)}
              >
                {localCard.description ? (
                  <p className="text-sm leading-relaxed">{localCard.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Add a more detailed description...</p>
                )}
              </div>
            )}
          </div>

          {/* AI Summary */}
          <div className="border border-border rounded-lg p-4 bg-card/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">AI Summary</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAISummary(!showAISummary)}
                className="text-muted-foreground"
              >
                {showAISummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {showAISummary ? (
              <div className="space-y-3 animate-slide-up">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm leading-relaxed">
                    This task involves creating mockups for a new homepage redesign. The team is considering a
                    minimalist approach. JD is leading the design work and will share initial mockups by end of day. The
                    task is currently in the "To Do" stage with high priority.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  <span>Generated by AI based on card details and comments</span>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAISummary}
                disabled={isGeneratingAI}
                className="w-full bg-transparent"
              >
                {isGeneratingAI ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Generating summary...
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Summary
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Comments */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Comments</h3>
              <span className="text-sm text-muted-foreground">({comments.length})</span>
            </div>

            {/* Add Comment */}
            <div className="mb-4 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-[80px] bg-background"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm">
                <Send className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="border border-border rounded-lg p-4 bg-background/50 animate-slide-up group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold">{comment.author}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{comment.author}</p>
                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed ml-10">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Card
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
