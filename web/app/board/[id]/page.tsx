"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, MoreHorizontal, Star, Users, Loader2, Mic, MicOff, Phone, PhoneOff, Square, Pencil, Trash2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { List } from "@/components/board/list";
import { Card } from "@/components/board/card";
import type { List as ColumnType, Card as CardType, User } from "@/lib/api"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import AgoraRTC from "agora-rtc-sdk-ng";



interface BoardPageProps {
  params: { id: string };
}

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });


export default function BoardPage({ params }: BoardPageProps) {
  const router = useRouter();
  const {toast}  = useToast();
  const [lists, setLists] = useState<ColumnType[]>([]);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [joined, setJoined] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioTrack, setAudioTrack] = useState<any>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [remoteUsers, setRemoteUsers] = useState<number[]>([]);
  const [localUid, setLocalUid] = useState<number | null>(null);
  const [speakingUsers, setSpeakingUsers] = useState<Set<number>>(new Set());
  
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListPosition, setNewListPosition] = useState(0);
  const [isCreatingList, setIsCreatingList] = useState(false);

  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [createCardListId, setCreateCardListId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  const [isRecordingCard, setIsRecordingCard] = useState(false)
  const [isTranscribingCard, setIsTranscribingCard] = useState(false)
  const mediaRecorderRefCard = useRef<MediaRecorder | null>(null)
  const audioChunksRefCard = useRef<Blob[]>([])

  const [editingListId, setEditingListId] = useState<number | null>(null)
  const [editingListName, setEditingListName] = useState("")
  const [isDeletingList, setIsDeletingList] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );
    const join = async () => {
    setIsConnecting(true);
    try {
      const response = await api.getAgoraToken(parseInt(params.id));
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const { token, appId, uid, channel } = response.data;
        setLocalUid(uid);

        // Setup event listeners
        client.removeAllListeners();
        
        client.on("user-joined", (user) => {
            setRemoteUsers(prev => {
                if (prev.includes(user.uid as number)) return prev;
                return [...prev, user.uid as number];
            });
        });
        client.on("user-left", (user) => {
            setRemoteUsers(prev => prev.filter(id => id !== user.uid));
        });
        client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === "audio") {
                user.audioTrack?.play();
            }
        });
        client.enableAudioVolumeIndicator();
        client.on("volume-indicator", (volumes) => {
            const speaking = new Set<number>();
            volumes.forEach(v => {
                if (v.level > 5) { // Threshold
                    speaking.add(v.uid as number);
                }
            });
            setSpeakingUsers(speaking);
        });

        await client.join(appId, channel, token, uid);
        const track = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([track]);
        setAudioTrack(track);
        setJoined(true);
        setShowVoiceModal(false);
        toast({
          title: "Connected",
          description: "Joined voice room successfully",
        });
      }
    } catch (err) {
      console.error('Error joining voice room:', err);
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to join voice room",
      });
    } finally {
      setIsConnecting(false);
    }
  }

  const leave = async () => {
    try {
      if (audioTrack) {
        audioTrack.close();
        setAudioTrack(null);
      }
      await client.leave();
      client.removeAllListeners();
      setRemoteUsers([]);
      setJoined(false);
      setIsMuted(false);
      toast({
        title: "Disconnected",
        description: "Left voice room",
      });
    } catch (err) {
      console.error('Error leaving voice room:', err);
    }
  }

  const toggleMute = async () => {
    if (audioTrack) {
      await audioTrack.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  }

  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getBoardWithLists(parseInt(params.id));
        
        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data?.board) {
          setLists(response.data.board.lists || []);
          setBoardTitle(response.data.board.name || 'Untitled Board');
          
          const owner: User = {
              id: response.data.board.owner_id,
              username: response.data.board.owner_username,
              email: response.data.board.owner_email,
              profile_image: response.data.board.owner_profile_image || "", 
          };
          const boardMembers = response.data.board.members || [];
          const allMembers = [owner, ...boardMembers.filter(m => m.id !== owner.id)];
          setMembers(allMembers);
        }
      } catch (err) {
        toast({
          description : 'Failed to load Board'
        })
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [params.id]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const card = lists
      .flatMap((list) => list.cards)
      .find((c) => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeCardId = active.id;
    
    let sourceList: ColumnType | undefined;
    let cardToMove: CardType | undefined;

    for (const list of lists) {
      const card = list.cards.find((c) => c.id === activeCardId);
      if (card) {
        sourceList = list;
        cardToMove = card;
        break;
      }
    }

    if (!sourceList || !cardToMove) {
      setActiveCard(null);
      return;
    }

    let targetList: ColumnType | undefined;
    
    targetList = lists.find((list) => list.id === over.id);
    
    if (!targetList) {
      for (const list of lists) {
        if (list.cards.some((c) => c.id === over.id)) {
          targetList = list;
          break;
        }
      }
    }

    if (!targetList) {
      setActiveCard(null);
      return;
    }

    if (sourceList.id === targetList.id) {
      setActiveCard(null);
      return;
    }

    const newPosition = targetList.cards.length;

    const originalLists = lists;

    try {
      setLists((prevLists) => {
        return prevLists.map((list) => {
          if (list.id === sourceList!.id) {
            return {
              ...list,
              cards: list.cards.filter((c) => c.id !== activeCardId),
            };
          }
          if (list.id === targetList!.id) {
            return {
              ...list,
              cards: [...list.cards, { ...cardToMove!, list_id: targetList!.id, position: newPosition }],
            };
          }
          return list;
        });
      });

      const response = await api.moveCard(Number(activeCardId), Number(targetList.id), newPosition);
      
      if (response.error) {
        throw new Error(response.error);
      }

    } catch (err) {
      console.error('Error moving card:', err);
      setLists(originalLists);
      toast({
        description: 'Failed to move card',
        variant: "destructive",
      });
    }

    setActiveCard(null);
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };

  const handleAddCard = async (listId: number) => {
    setCreateCardListId(listId);
    setShowCreateCardModal(true);
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || createCardListId === null) return;

    setIsCreatingCard(true);
    try {
      const targetList = lists.find(list => list.id === createCardListId);
      const newPosition = targetList ? targetList.cards.length : 0;
      
      const response = await api.createCard(createCardListId, newCardTitle, newCardDescription, newPosition);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const createdCard: CardType = {
          id: response.data.card.id,
          list_id: response.data.card.list_id || createCardListId,
          title: response.data.card.title || newCardTitle,
          description: response.data.card.description,
          position: response.data.card.position || newPosition,
          labels: response.data.card.labels || [],
          assignees: response.data.card.assignees || [],
          due_date: response.data.card.due_date,
        };
        
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === createCardListId 
              ? { ...list, cards: [...list.cards, createdCard] } 
              : list
          )
        );
        
        setShowCreateCardModal(false);
        setNewCardTitle("");
        setNewCardDescription("");
        setCreateCardListId(null);
        
        toast({
          title: "Success",
          description: "Card created successfully!",
        });
      }
    } catch (err) {
      console.error('Error creating card:', err);
      toast({
        variant: "destructive",
        description: "Error creating card",
        title: "Error",
      });
    } finally {
      setIsCreatingCard(false);
    }
  };

  const handleUpdateCard = async (updatedCard: CardType) => {
    try {
      const response = await api.updateCard(updatedCard.id, updatedCard);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const updated = response.data as CardType;
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === updated.id ? updated : card,
            ),
          })),
        );
      }
    } catch (err) {
      console.error('Error updating card:', err);
     toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update card",
      });
    }
  };

  const handleDeleteCard = async () => {
    if (!activeCard) return;

    try {
      const response = await api.deleteCard(activeCard.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setLists((prevLists) =>
        prevLists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== activeCard.id),
        })),
      );
      setActiveCard(null);
    } catch (err) {
      console.error('Error deleting card:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete card",
      });
    }
  };

  const handleAddList = () => {
    const nextPosition = lists.length > 0 ? Math.max(...lists.map(l => l.position)) + 1 : 0;
    setNewListPosition(nextPosition);
    setShowCreateListModal(true);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setIsCreatingList(true);
    try {
      const response = await api.createList(parseInt(params.id), newListName);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const newList = { ...response.data, cards: [] };
        setLists(prev => [...prev, newList]);
        setShowCreateListModal(false);
        setNewListName("");
      }
    } catch (err) {
      console.error('Error creating list:', err);
      toast({
        description:'Failed to create list',
        variant: "destructive", 
        title: "Error",
      })
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleEditList = (listId: number, currentName: string) => {
    setEditingListId(listId)
    setEditingListName(currentName)
  }

  const handleUpdateList = async (listId: number) => {
    if (!editingListName.trim()) return

    try {
      const response = await api.updateList(listId, editingListName)
      
      if (response.error) {
        throw new Error(response.error)
      }

      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, name: editingListName } : list
        )
      )

      setEditingListId(null)
      setEditingListName("")

      toast({
        title: "Success",
        description: "List updated successfully",
      })
    } catch (err) {
      console.error('Error updating list:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update list",
      })
    }
  }

  const handleDeleteList = async (listId: number) => {
    if (!confirm("Are you sure you want to delete this list? All cards in this list will be deleted.")) {
      return
    }

    setIsDeletingList(listId)
    try {
      const response = await api.deleteList(listId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      setLists((prevLists) => prevLists.filter((list) => list.id !== listId))

      toast({
        title: "Success",
        description: "List deleted successfully",
      })
    } catch (err) {
      console.error('Error deleting list:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete list",
      })
    } finally {
      setIsDeletingList(null)
    }
  }

  const handleAssignUser = async (cardId: number, userId: number) => {
    try {
      const response = await api.assignUserToCard(cardId, userId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      setLists((prevLists) =>
        prevLists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  assignees: response?.data?.assignees || [],
                }
              : card
          ),
        }))
      )

      toast({
        title: "Success",
        description: "User assigned to card",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign user",
      })
    }
  }

  const handleUnassignUser = async (cardId: number, userId: number) => {
    try {
      const response = await api.unassignUserFromCard(cardId, userId)
      
      if (response.error) {
        throw new Error(response.error)
      }
      setLists((prevLists) =>
        prevLists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  assignees: (card.assignees || []).filter((a) => a.id !== userId),
                }
              : card
          ),
        }))
      )

      toast({
        title: "Success",
        description: "User unassigned from card",
      })
    } catch (err) {
      console.error("Error unassigning user:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unassign user",
      })
    }
  }

  const startCardRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRefCard.current = mediaRecorder
      audioChunksRefCard.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRefCard.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRefCard.current, { type: 'audio/wav' })
        await transcribeCardAudio(audioBlob)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecordingCard(true)
      
      toast({
        title: "Recording Started",
        description: "Describe your new card",
      })
    } catch (err) {
      console.error('Error starting recording:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone",
      })
    }
  }

  const stopCardRecording = () => {
    if (mediaRecorderRefCard.current && mediaRecorderRefCard.current.state === 'recording') {
      mediaRecorderRefCard.current.stop()
      setIsRecordingCard(false)
    }
  }

  const transcribeCardAudio = async (audioBlob: Blob) => {
    setIsTranscribingCard(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'card-recording.wav')

      const response = await fetch('http://localhost:8080/api/speech-to-text', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.text) {
        setNewCardTitle(data.text)
        
        toast({
          title: "Voice Input Complete",
          description: "Card title set from voice",
        })
      }
    } catch (err) {
      console.error('Error transcribing audio:', err)
      toast({
        variant: "destructive",
        title: "Transcription Failed",
        description: "Could not convert speech to text",
      })
    } finally {
      setIsTranscribingCard(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading board...</span>
        </div>
      </div>
    );
  }

  if (error && lists.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80 shadow-sm">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/boards"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-accent"
                title="Back to boards"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
               <div>
                  <h1 className="text-xl font-bold">{boardTitle}</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pr-6">
              {/* Voice Room Button */}
              {!joined ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowVoiceModal(true)}
                  className="gap-2 hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/30"
                  disabled={isConnecting}
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Voice</span>
                </Button>
              ) : (
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm">
                  {/* Participants */}
                  <div className="flex -space-x-2 mr-2">
                    {/* Local User */}
                    {localUid && (
                        <div className={`relative rounded-full transition-all duration-300 ${speakingUsers.has(localUid) ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-background' : ''}`}>
                            <Avatar className="w-8 h-8 border-2 border-background">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">ME</AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                    {/* Remote Users */}
                    {remoteUsers.map(uid => {
                        const user = members.find(m => m.id === uid);
                        return (
                            <div key={uid} className={`relative rounded-full transition-all duration-300 ${speakingUsers.has(uid) ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-background' : ''}`}>
                                <Avatar className="w-8 h-8 border-2 border-background" title={user?.username || 'Unknown'}>
                                    <AvatarImage src={user?.profile_image} />
                                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                        {user?.username?.substring(0, 2).toUpperCase() || '??'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        );
                    })}
                  </div>

                  <div className="w-px h-4 bg-border/40"></div>

                  <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={toggleMute}
                        className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                        isMuted 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' 
                            : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={leave}
                        className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                    >
                        <PhoneOff className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                variant="ghost" 
                size="sm"
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Star</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-accent"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-3 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2 rounded-lg flex items-center justify-between animate-fade-in">
              <span className="text-sm">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-destructive hover:text-destructive/80 font-bold transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="p-6 pl-12 pr-12">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-6 min-h-[calc(100vh-200px)]">
            {lists.map((list) => (
              <div key={list.id} className="flex-shrink-0 w-80">
                <List
                  list={list}
                  onAddCard={handleAddCard}
                  onCardClick={(card) => {
                    router.push(`/board/${params.id}/card/${card.id}`)
                  }}
                  onAssignUser={handleAssignUser}
                  onUnassignUser={handleUnassignUser}
                  isEditingTitle={editingListId === list.id}
                  editingTitle={editingListName}
                  onEditTitle={(name) => setEditingListName(name)}
                  onSaveTitle={() => handleUpdateList(list.id)}
                  onCancelEdit={() => {
                    setEditingListId(null)
                    setEditingListName("")
                  }}
                  onEdit={() => handleEditList(list.id, list.name)}
                  onDelete={() => handleDeleteList(list.id)}
                  isDeleting={isDeletingList === list.id}
                />
              </div>
            ))}

            {/* Add List Button */}
            <div className="flex-shrink-0 w-80">
              <button 
                onClick={handleAddList}
                className="w-full border border-dashed border-border rounded-lg p-4 bg-card/30 hover:bg-card/50 hover:border-primary/50 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  Add List
                </span>
              </button>
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeCard ? (
              <div className="w-80 opacity-60 pointer-events-none rotate-2 scale-105">
                <Card card={activeCard} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Card Modal */}
      {showCreateCardModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => {
            setShowCreateCardModal(false);
            setNewCardTitle("");
            setNewCardDescription("");
            setCreateCardListId(null);
          }}
          style={{ position: 'fixed' }}
        >
          <div
            className="w-full max-w-md border border-border rounded-xl p-8 bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Create new card</h2>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Card title
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g., Design homepage mockup"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    required
                    className="bg-background border-border pr-12"
                    disabled={isCreatingCard || isRecordingCard || isTranscribingCard}
                    autoFocus
                  />
                  
                  {/* Voice Input Button for Card Title */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {!isRecordingCard && !isTranscribingCard ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={startCardRecording}
                        className="h-6 w-6 p-0 hover:bg-primary/10"
                        title="Voice input"
                      >
                        <Mic className="w-3 h-3" />
                      </Button>
                    ) : isRecordingCard ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={stopCardRecording}
                        className="h-6 w-6 p-0 text-red-600 animate-pulse"
                        title="Stop recording"
                      >
                        <Square className="w-3 h-3 fill-current" />
                      </Button>
                    ) : (
                      <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
                
                {isRecordingCard && (
                  <p className="text-xs text-red-600 mt-1 animate-fade-in">
                    🔴 Recording... Speak the card title
                  </p>
                )}
                
                {isTranscribingCard && (
                  <p className="text-xs text-primary mt-1 animate-fade-in">
                    Processing voice input...
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description (optional)
                </label>
                <textarea
                  placeholder="Add more details about this card..."
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isCreatingCard}
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isCreatingCard || !newCardTitle.trim() || isRecordingCard || isTranscribingCard}
                >
                  {isCreatingCard ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create Card"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateCardModal(false);
                    setNewCardTitle("");
                    setNewCardDescription("");
                    setCreateCardListId(null);
                  }}
                  disabled={isCreatingCard || isRecordingCard || isTranscribingCard}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateListModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setShowCreateListModal(false)}
        >
          <div
            className="w-full max-w-md border border-border rounded-xl p-8 bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Create new list</h2>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  List name
                </label>
                <Input
                  placeholder="e.g., To Do, In Progress, Done"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                  className="bg-background border-border"
                  disabled={isCreatingList}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Position
                </label>
                <Input
                  type="number"
                  value={newListPosition}
                  onChange={(e) => setNewListPosition(parseInt(e.target.value) || 0)}
                  min="0"
                  className="bg-background border-border"
                  disabled={isCreatingList}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Position determines the order of lists (lower numbers appear first)
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isCreatingList || !newListName.trim()}
                >
                  {isCreatingList ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create List"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateListModal(false);
                    setNewListName("");
                  }}
                  disabled={isCreatingList}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voice Room Modal */}
      {showVoiceModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={() => setShowVoiceModal(false)}
          style={{ position: 'fixed' }}
        >
          <div
            className="w-full max-w-sm bg-card/95 backdrop-blur-xl border border-border/20 rounded-2xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-6">

              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight">Join Voice</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect with your team members
                </p>
              </div>
              
              <div className="space-y-3 pt-2">
                <Button
                  onClick={join}
                  className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium rounded-xl"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Connecting
                    </div>
                  ) : (
                    "Join Room"
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => setShowVoiceModal(false)}
                  className="w-full h-11 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-xl font-medium"
                  disabled={isConnecting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
