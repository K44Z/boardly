"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, AlignLeft, Tag, Users, MessageSquare, Sparkles, ChevronDown, ChevronUp, Trash2, Send, X, Plus, Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Card as CardType, User, Label } from "@/lib/api"

interface CardPageProps {
  params: { id: string; cardId: string }
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
}

export default function CardPage({ params }: CardPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [card, setCard] = useState<CardType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [showAISummary, setShowAISummary] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiSummary, setAiSummary] = useState<string>("")
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

  const [localCard, setLocalCard] = useState<CardType | null>(null)
  
  // New state for labels and users
  const [showLabelModal, setShowLabelModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [availableLabels, setAvailableLabels] = useState<Label[]>([])
  const [loadingLabels, setLoadingLabels] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showLabelDropdown, setShowLabelDropdown] = useState(false)

  useEffect(() => {
    const loadCard = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.getCard(parseInt(params.cardId))
        
        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          setCard(response.data.card)
          setLocalCard(response.data.card)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load card"
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
      } finally {
        setLoading(false)
      }
    }

    loadCard()
  }, [params.cardId, toast])

  // Load available labels when component mounts
  useEffect(() => {
    const loadAvailableLabels = async () => {
      setLoadingLabels(true)
      try {
        const response = await api.getAvailableLabels()
        if (response.data?.labels) {
          setAvailableLabels(response.data.labels)
        }
      } catch (err) {
        console.error("Failed to load labels:", err)
      } finally {
        setLoadingLabels(false)
      }
    }

    loadAvailableLabels()
  }, [])

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!userSearch.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await api.searchUsers(userSearch)
        if (response.data?.users) {
          // Filter out already assigned users
          const filtered = response.data.users.filter(user => 
            !localCard?.assignees?.some(assignee => assignee.id === user.id)
          )
          setSearchResults(filtered)
        }
      } catch (err) {
        console.error("Failed to search users:", err)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [userSearch, localCard?.assignees])

  const handleClose = () => {
    router.push(`/board/${params.id}`)
  }

  const handleGenerateAISummary = async () => {
    if (!localCard) return

    setIsGeneratingAI(true)
    try {
      const context = `
Card Title: ${localCard.title}
Description: ${localCard.description || "No description provided"}
Labels: ${localCard.labels?.map(l => l.name).join(", ") || "No labels"}
Assignees: ${localCard.assignees?.map(a => a.username).join(", ") || "No assignees"}
Comments: ${comments.map(c => `${c.author}: ${c.content}`).join("\n") || "No comments"}
      `.trim()

      const response = await fetch("http://localhost:8080/api/ai/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-r1:1.5b",
          prompt: `Please provide a concise summary of this project card in 2-3 sentences. Focus on the main task, current status, and key details:\n\n${context}`,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.response) {
        setAiSummary(data.response.response.trim())
        setShowAISummary(true)
      } else {
        throw new Error("No response from AI model")
      }
    } catch (err) {
      console.error("Error generating AI summary:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate AI summary. Please try again.",
      })
    } finally {
      setIsGeneratingAI(false)
    }
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

  const handleUpdateTitle = async (title: string) => {
    if (!localCard) return
    const updatedCard = { ...localCard, title }
    setLocalCard(updatedCard)
    
    try {
      const response = await api.updateCard(updatedCard.id, updatedCard)
      
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setCard(response.data as CardType)
        setLocalCard(response.data as CardType)
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update card title",
      })
    }
  }

  const handleUpdateDescription = async (description: string) => {
    if (!localCard) return
    const updatedCard = { ...localCard, description }
    setLocalCard(updatedCard)
    
    try {
      const response = await api.updateCard(updatedCard.id, updatedCard)
      
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setCard(response.data as CardType)
        setLocalCard(response.data as CardType)
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update card description",
      })
    }
  }

  const handleDelete = async () => {
    try {
      const response = await api.deleteCard(parseInt(params.cardId))
      
      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Success",
        description: "Card deleted successfully",
      })
      
      router.push(`/board/${params.id}`)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete card",
      })
    }
  }

  const handleAssignUser = async (user: User) => {
    if (!localCard) return

    try {
      const response = await api.assignUserToCard(parseInt(params.cardId), user.id)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Update local state
      const updatedAssignees = [...(localCard.assignees || []), user]
      const updatedCard = { ...localCard, assignees: updatedAssignees }
      setLocalCard(updatedCard)
      setCard(updatedCard)
      
      toast({
        title: "Success",
        description: `${user.username} assigned to card`,
      })
      
      setShowUserModal(false)
      setUserSearch("")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign user",
      })
    }
  }

  const handleUnassignUser = async (userId: number) => {
    if (!localCard) return

    try {
      const response = await api.unassignUserFromCard(parseInt(params.cardId), userId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      const updatedAssignees = localCard.assignees?.filter(assignee => assignee.id !== userId) || []
      const updatedCard = { ...localCard, assignees: updatedAssignees }
      setLocalCard(updatedCard)
      setCard(updatedCard)
      
      toast({
        title: "Success",
        description: "User unassigned from card",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unassign user",
      })
    }
  }

  const handleToggleLabel = async (label: Label) => {
    if (!localCard) return

    const hasLabel = localCard.labels?.some(l => l.id === label.id)

    try {
      if (hasLabel) {
        const response = await api.removeLabelFromCard(localCard.id, label.id)
        
        if (response.error) {
          throw new Error(response.error)
        }

        const updatedLabels = localCard.labels?.filter(l => l.id !== label.id) || []
        const updatedCard = { ...localCard, labels: updatedLabels }
        setLocalCard(updatedCard)
        setCard(updatedCard)
        
        toast({
          title: "Success",
          description: `Removed label "${label.name}"`,
        })
      } else {
        const response = await api.addLabelToCard(localCard.id, label.id)
        
        if (response.error) {
          throw new Error(response.error)
        }

        const updatedLabels = [...(localCard.labels || []), label]
        const updatedCard = { ...localCard, labels: updatedLabels }
        setLocalCard(updatedCard)
        setCard(updatedCard)
        
        toast({
          title: "Success",
          description: `Added label "${label.name}"`,
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: hasLabel ? "Failed to remove label" : "Failed to add label",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading card...</span>
        </div>
      </div>
    )
  }

  if (error || !card || !localCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Card not found"}</p>
          <button 
            onClick={handleClose}
            className="text-primary hover:underline"
          >
            Back to Board
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={handleClose} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Board
          </Button>
          
          <div className="flex items-start justify-between">
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
                <h1
                  className="text-3xl font-bold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {localCard.title}
                </h1>
              )}
              <p className="text-sm text-muted-foreground mt-1">in To Do</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Labels */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Labels</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {localCard.labels && localCard.labels.length > 0 ? (
                localCard.labels.map((label) => (
                  <div key={label.id}>
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium bg-muted/50 border border-border">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="leading-none text-foreground">{label.name}</span>
                    </div>
                  </div>
                ))
              ) : null}
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-4 bg-transparent border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                  onClick={() => setShowLabelDropdown(!showLabelDropdown)}
                >
                  <Tag className="w-3.5 h-3.5 mr-2" />
                  Manage labels
                  <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${showLabelDropdown ? 'rotate-180' : ''}`} />
                </Button>

                {/* Label Dropdown */}
                {showLabelDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-background rounded-lg border border-border shadow-lg z-50">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Manage Labels</h4>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => setShowLabelDropdown(false)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {loadingLabels ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="ml-2 text-xs">Loading...</span>
                        </div>
                      ) : (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {availableLabels.map((label) => {
                            const isSelected = localCard?.labels?.some(l => l.id === label.id)
                            return (
                              <label
                                key={label.id}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                              >
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleLabel(label)}
                                    className="sr-only"
                                  />
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                    isSelected 
                                      ? 'bg-primary border-primary text-primary-foreground' 
                                      : 'border-muted-foreground/30 hover:border-primary/50'
                                  }`}>
                                    {isSelected && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                </div>
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: label.color }}
                                />
                                <span className="text-sm font-medium flex-1">{label.name}</span>
                              </label>
                            )
                          })}
                          {availableLabels.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              No labels available
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Assignees</h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {localCard.assignees && localCard.assignees.length > 0 ? (
                localCard.assignees.map((assignee) => (
                  <div key={assignee.id} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {assignee.profile_image ? (
                        <img 
                          src={assignee.profile_image} 
                          alt={assignee.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {assignee.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm">{assignee.username}</span>
                    <button
                      onClick={() => handleUnassignUser(assignee.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))
              ) : null}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent"
                onClick={() => setShowUserModal(true)}
              >
                <Users className="w-3 h-3 mr-2" />
                Add assignee
              </Button>
            </div>

            {/* User Assignment Modal */}
            {showUserModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-background rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Assign User</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowUserModal(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="ml-2 text-sm">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleAssignUser(user)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            {user.profile_image ? (
                              <img 
                                src={user.profile_image} 
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </button>
                      ))
                    ) : userSearch ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No users found
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Start typing to search for users
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                  value={localCard.description || ""}
                  onChange={(e) => setLocalCard({ ...localCard, description: e.target.value })}
                  placeholder="Add a more detailed description..."
                  className="min-h-[120px] bg-background"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => {
                    handleUpdateDescription(localCard.description || "")
                    setIsEditingDescription(false)
                  }}>
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

            {showAISummary && aiSummary ? (
              <div className="space-y-3 animate-slide-up">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm leading-relaxed">
                    {aiSummary}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  <span>Generated by AI based on card details and comments</span>
                </div>
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
                      Regenerating...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Regenerate Summary
                    </>
                  )}
                </Button>
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
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Card
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
