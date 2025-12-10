"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, AlignLeft, Tag, Users, MessageSquare, Sparkles, ChevronDown, ChevronUp, Trash2, Send, X, Plus, Search, Check, Mic, Square } from "lucide-react"
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
  const [boardMembers, setBoardMembers] = useState<User[]>([])
  const [showLabelDropdown, setShowLabelDropdown] = useState(false)
  const [labelSearch, setLabelSearch] = useState("")
  
  // Text-to-speech state
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingTarget, setRecordingTarget] = useState<'comment' | 'description' | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // Fetch board members
  useEffect(() => {
    const fetchBoardMembers = async () => {
      try {
        const response = await api.getBoardWithLists(parseInt(params.id))
        if (response.data?.board) {
          const owner: User = {
            id: response.data.board.owner_id,
            username: response.data.board.owner_username,
            email: response.data.board.owner_email,
            profile_image: response.data.board.owner_profile_image || "",
          }
          const members = response.data.board.members || []
          const allMembers = [
            owner,
            ...members.filter((m) => m.id !== owner.id),
          ]
          setBoardMembers(allMembers)
          setSearchResults(allMembers)
        }
      } catch (err) {
        console.error("Failed to fetch board members", err)
      }
    }
    fetchBoardMembers()
  }, [params.id])

  // Filter users locally
  useEffect(() => {
    if (!boardMembers.length) return

    const filtered = boardMembers.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                          user.email.toLowerCase().includes(userSearch.toLowerCase())
      const isNotAssigned = !localCard?.assignees?.some(assignee => assignee.id === user.id)
      return matchesSearch && isNotAssigned
    })
    
    setSearchResults(filtered)
  }, [userSearch, boardMembers, localCard?.assignees])

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

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

  const startRecording = async (target: 'comment' | 'description') => {
    try {
      setRecordingTarget(target)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await transcribeAudio(audioBlob, target)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      toast({
        title: "Recording Started",
        description: "Speak now to add your text",
      })
    } catch (err) {
      console.error('Error starting recording:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
      })
      setRecordingTarget(null)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const transcribeAudio = async (audioBlob: Blob, target: 'comment' | 'description') => {
    setIsTranscribing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      const response = await fetch('http://localhost:8080/api/ai/stt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.text) {
        if (target === 'comment') {
          setNewComment(prev => prev ? `${prev} ${data.text}` : data.text)
        } else if (target === 'description') {
          setLocalCard(prev => prev ? { ...prev, description: prev.description ? `${prev.description} ${data.text}` : data.text } : null)
        }
        
        toast({
          title: "Transcription Complete",
          description: "Speech converted to text successfully",
        })
      } else {
        throw new Error("No transcription received")
      }
    } catch (err) {
      console.error('Error transcribing audio:', err)
      toast({
        variant: "destructive",
        title: "Transcription Failed",
        description: "Could not convert speech to text. Please try again.",
      })
    } finally {
      setIsTranscribing(false)
      setRecordingTarget(null)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
      <div className="w-full max-w-7xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={handleClose} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Board
          </Button>
          
          <div className="space-y-2">
            {isEditingTitle ? (
              <Input
                value={localCard.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                autoFocus
                className="text-3xl font-bold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
              />
            ) : (
              <h1
                className="text-4xl font-bold cursor-pointer hover:text-primary transition-colors leading-tight"
                onClick={() => setIsEditingTitle(true)}
              >
                {localCard.title}
              </h1>
            )}
            <p className="text-muted-foreground">in To Do</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlignLeft className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Description</h3>
              </div>
              {isEditingDescription ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Textarea
                      value={localCard.description || ""}
                      onChange={(e) => setLocalCard({ ...localCard, description: e.target.value })}
                      placeholder="Add a more detailed description..."
                      className="min-h-[240px] bg-background resize-none pr-12"
                      autoFocus
                      disabled={isRecording || isTranscribing}
                    />
                    {/* Voice Input Button */}
                    <div className="absolute bottom-3 right-3">
                      {!isRecording && !isTranscribing ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startRecording('description')}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                          title="Record voice description"
                        >
                          <Mic className="w-4 h-4" />
                        </Button>
                      ) : isRecording && recordingTarget === 'description' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatRecordingTime(recordingTime)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={stopRecording}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors animate-pulse"
                            title="Stop recording"
                          >
                            <Square className="w-4 h-4 fill-current" />
                          </Button>
                        </div>
                      ) : isTranscribing && recordingTarget === 'description' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Recording Status Banner for Description */}
                  {isRecording && recordingTarget === 'description' && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg animate-fade-in">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        Recording... Speak clearly into your microphone
                      </span>
                    </div>
                  )}

                  {isTranscribing && recordingTarget === 'description' && (
                    <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-primary">
                        Converting speech to text...
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      handleUpdateDescription(localCard.description || "")
                      setIsEditingDescription(false)
                    }} disabled={isRecording || isTranscribing}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setLocalCard({ ...localCard, description: card.description })
                        setIsEditingDescription(false)
                      }}
                      disabled={isRecording || isTranscribing}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-6 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors min-h-[100px] border border-border/50"
                  onClick={() => setIsEditingDescription(true)}
                >
                  {localCard.description ? (
                    <p className="leading-relaxed break-words whitespace-pre-wrap">{localCard.description}</p>
                  ) : (
                    <p className="text-muted-foreground">Add a more detailed description...</p>
                  )}
                </div>
              )}
            </div>

            {/* AI Summary */}
            <div className="border border-border/50 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">AI Summary</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAISummary(!showAISummary)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showAISummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {showAISummary && aiSummary ? (
                <div className="space-y-4 animate-slide-up">
                  <div className="p-4 rounded-lg bg-background/80 border border-primary/20">
                    <p className="leading-relaxed">{aiSummary}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span>Generated by AI based on card details and comments</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAISummary}
                    disabled={isGeneratingAI}
                    className="w-full"
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
                  className="w-full"
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Comments</h3>
                <span className="px-2 py-1 rounded-full bg-muted text-sm text-muted-foreground">
                  {comments.length}
                </span>
              </div>

              <div className="mb-6 space-y-3">
                <div className="relative">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment or use voice input..."
                    className="min-h-[80px] bg-background border-border/50 resize-none pr-12"
                    disabled={isRecording || isTranscribing}
                  />
                  
                  {/* Voice Input Button */}
                  <div className="absolute bottom-3 right-3">
                    {!isRecording && !isTranscribing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startRecording('comment')}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Record voice message"
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                    ) : isRecording && recordingTarget === 'comment' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatRecordingTime(recordingTime)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopRecording}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors animate-pulse"
                          title="Stop recording"
                        >
                          <Square className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                    ) : isTranscribing && recordingTarget === 'comment' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-xs text-muted-foreground">Processing...</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Recording Status Banner */}
                {isRecording && recordingTarget === 'comment' && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg animate-fade-in">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      Recording... Speak clearly into your microphone
                    </span>
                    <span className="text-xs text-red-600 dark:text-red-400 font-mono ml-auto">
                      {formatRecordingTime(recordingTime)}
                    </span>
                  </div>
                )}

                {isTranscribing && recordingTarget === 'comment' && (
                  <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-primary">
                      Converting speech to text...
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || isRecording || isTranscribing} 
                    size="sm" 
                    className="w-fit"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Add Comment
                  </Button>
                  
                  {newComment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewComment("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className="border border-border/50 rounded-xl p-4 bg-background/50 animate-slide-up group hover:shadow-sm transition-all duration-200"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-semibold">{comment.author}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{comment.author}</p>
                          <p className="text-sm text-muted-foreground">{comment.timestamp}</p>
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
                    <p className="leading-relaxed ml-12 break-words whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Labels */}
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Labels</h3>
              </div>
              <div className="space-y-3">
                {localCard.labels && localCard.labels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {localCard.labels.map((label) => (
                      <div key={label.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-muted/50 border border-border">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-foreground">{label.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No labels assigned</p>
                )}
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-center bg-transparent border-dashed"
                    onClick={() => setShowLabelDropdown(true)}
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Manage labels
                  </Button>
                </div>
              </div>
            </div>

            {/* Assignees */}
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Assignees</h3>
              </div>
              <div className="space-y-3">
                {localCard.assignees && localCard.assignees.length > 0 ? (
                  <div className="space-y-2">
                    {localCard.assignees.map((assignee) => (
                      <div key={assignee.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
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
                        <span className="flex-1 text-sm font-medium">{assignee.username}</span>
                        <button
                          onClick={() => handleUnassignUser(assignee.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No one assigned</p>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-center bg-transparent border-dashed"
                  onClick={() => setShowUserModal(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Add assignee
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button variant="destructive" onClick={handleDelete} className="w-full justify-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Card
                </Button>
                <Button onClick={handleClose} variant="outline" className="w-full justify-center">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Label Management Modal */}
        {showLabelDropdown && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Manage Labels</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowLabelDropdown(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search labels..."
                    value={labelSearch}
                    onChange={(e) => setLabelSearch(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>
              
              {loadingLabels ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="ml-2 text-xs">Loading...</span>
                </div>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableLabels
                    .filter(label => label.name.toLowerCase().includes(labelSearch.toLowerCase()))
                    .sort((a, b) => {
                      const isSelectedA = localCard?.labels?.some(l => l.id === a.id) ? 1 : 0;
                      const isSelectedB = localCard?.labels?.some(l => l.id === b.id) ? 1 : 0;
                      return isSelectedB - isSelectedA;
                    })
                    .map((label) => {
                      const isSelected = localCard?.labels?.some(l => l.id === label.id)
                      return (
                        <label
                          key={label.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
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
                  {availableLabels.filter(label => label.name.toLowerCase().includes(labelSearch.toLowerCase())).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {availableLabels.length === 0 ? "No labels available" : "No matching labels"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
                {searchResults.length > 0 ? (
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
                    No members found matching "{userSearch}"
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All board members are already assigned
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
