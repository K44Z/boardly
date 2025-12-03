"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, MoreHorizontal, Star, Users, Loader2 } from "lucide-react";
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
import type { List as ColumnType, Card as CardType } from "@/lib/api"; // Updated import
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


interface BoardPageProps {
  params: { id: string };
}

export default function BoardPage({ params }: BoardPageProps) {
  const router = useRouter();
  const {toast}  = useToast();
  const [lists, setLists] = useState<ColumnType[]>([]);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState('');
  
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListPosition, setNewListPosition] = useState(0);
  const [isCreatingList, setIsCreatingList] = useState(false);

  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [createCardListId, setCreateCardListId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );

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
        // Add empty cards array for new list
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

      <div className="p-6 overflow-x-auto pl-12 pr-12">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-6 min-h-[calc(100vh-200px)]">
            {lists.map((list) => (
              <List
                key={list.id}
                list={list}
                onAddCard={handleAddCard}
                onCardClick={(card) => {
                  router.push(`/board/${params.id}/card/${card.id}`)
                }}
                onAssignUser={handleAssignUser}
                onUnassignUser={handleUnassignUser}
              />
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
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
                <Input
                  placeholder="e.g., Design homepage mockup"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  required
                  className="bg-background border-border"
                  disabled={isCreatingCard}
                  autoFocus
                />
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
                  disabled={isCreatingCard || !newCardTitle.trim()}
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
                  disabled={isCreatingCard}
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
    </div>
  );
}
