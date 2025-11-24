"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, MoreHorizontal, Star, Users, Loader2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column } from "@/components/board/column";
import { Card } from "@/components/board/card";
import { CardModal } from "@/components/board/card-modal";
import type { Column as ColumnType, Card as CardType } from "@/types/board";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";

const AVATARS = [
  {
    src: "https://pbs.twimg.com/profile_images/1948770261848756224/oPwqXMD6_400x400.jpg",
    fallback: "SK",
    tooltip: "Skyleen",
  },
  {
    src: "https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg",
    fallback: "CN",
    tooltip: "Shadcn",
  },
  {
    src: "https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg",
    fallback: "AW",
    tooltip: "Adam Wathan",
  },
  {
    src: "https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg",
    fallback: "GR",
    tooltip: "Guillermo Rauch",
  },
  {
    src: "https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg",
    fallback: "JH",
    tooltip: "Jhey",
  },
  {
    src: "https://pbs.twimg.com/profile_images/1927474594102784000/Al0g-I6o_400x400.jpg",
    fallback: "DH",
    tooltip: "David Haz",
  },
];

interface BoardPageProps {
  params: { id: string };
}

export default function BoardPage({ params }: BoardPageProps) {
  const [lists, setLists] = useState<ColumnType[]>([]);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Load board data on mount
  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getBoardWithLists(parseInt(params.id));
        
        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          setLists(response.data.lists || []);
          setBoardTitle(response.data.title || 'Untitled Board');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load board');
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
    const overListId = over.id;

    // Find source list and card
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

    // Find target list
    const targetList = lists.find(
      (list) =>
        list.id === overListId || list.cards.some((c) => c.id === over.id),
    );

    if (!targetList) {
      setActiveCard(null);
      return;
    }

    // If same list, do nothing
    if (sourceList.id === targetList.id) {
      setActiveCard(null);
      return;
    }

    try {
      // Optimistic update
      setLists((prevLists) => {
        return prevLists.map((list) => {
          if (list.id === sourceList.id) {
            return {
              ...list,
              cards: list.cards.filter((c) => c.id !== activeCardId),
            };
          }
          if (list.id === targetList.id) {
            return {
              ...list,
              cards: [...list.cards, cardToMove],
            };
          }
          return list;
        });
      });

      // API call
      const response = await api.moveCard(activeCardId, targetList.id);
      
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Error moving card:', err);
      // Revert optimistic update on error
      const boardResponse = await api.getBoardWithLists(parseInt(params.id));
      if (boardResponse.data) {
        setLists(boardResponse.data.lists || []);
      }
      setError('Failed to move card');
    }

    setActiveCard(null);
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };

  const handleAddCard = async (listId: string) => {
    try {
      const newCard = {
        title: "New Task",
        description: "",
        labels: [],
        assignees: [],
        comments: 0,
      };

      const response = await api.createCard(listId, newCard);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId ? { ...list, cards: [...list.cards, response.data] } : list,
          ),
        );
      }
    } catch (err) {
      console.error('Error creating card:', err);
      setError('Failed to create card');
    }
  };

  const handleUpdateCard = async (updatedCard: CardType) => {
    try {
      const response = await api.updateCard(updatedCard.id, updatedCard);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === updatedCard.id ? response.data : card,
            ),
          })),
        );
        setSelectedCard(response.data);
      }
    } catch (err) {
      console.error('Error updating card:', err);
      setError('Failed to update card');
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;

    try {
      const response = await api.deleteCard(selectedCard.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setLists((prevLists) =>
        prevLists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== selectedCard.id),
        })),
      );
      setSelectedCard(null);
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Failed to delete card');
    }
  };

  const handleAddList = async () => {
    try {
      const response = await api.createList(parseInt(params.id), 'New List');
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setLists(prev => [...prev, response.data]);
      }
    } catch (err) {
      console.error('Error creating list:', err);
      setError('Failed to create list');
    }
  };

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/boards"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{boardTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Board */}
      <div className="p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-6 min-h-[calc(100vh-200px)]">
            {lists.map((list) => (
              <Column
                key={list.id}
                column={list}
                onAddCard={handleAddCard}
                onCardClick={(card) => setSelectedCard(card)}
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

          <DragOverlay>
            {activeCard ? (
              <div className="w-80 opacity-80">
                <Card card={activeCard} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Details Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
}
