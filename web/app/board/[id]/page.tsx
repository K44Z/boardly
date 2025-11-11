"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, MoreHorizontal, Star, Users } from "lucide-react";
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

const initialColumns: ColumnType[] = [
  {
    id: "todo",
    title: "To Do",
    cards: [
      {
        id: "1",
        title: "Design new landing page",
        description: "Create mockups for the new homepage redesign",
        labels: ["Design", "High Priority"],
        assignees: ["JD", "SM"],
        comments: 3,
      },
      {
        id: "2",
        title: "Update documentation",
        description: "Add API reference docs",
        labels: ["Documentation"],
        assignees: ["JD"],
        comments: 1,
      },
      {
        id: "3",
        title: "Fix mobile navigation",
        description: "Menu not working on iOS devices",
        labels: ["Bug", "Mobile"],
        assignees: ["TK"],
        comments: 5,
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    cards: [
      {
        id: "4",
        title: "Implement authentication",
        description: "Add OAuth and email/password login",
        labels: ["Development", "High Priority"],
        assignees: ["SM", "TK"],
        comments: 8,
      },
      {
        id: "5",
        title: "Database optimization",
        description: "Improve query performance",
        labels: ["Backend"],
        assignees: ["TK"],
        comments: 2,
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [
      {
        id: "6",
        title: "User dashboard redesign",
        description: "New layout with analytics",
        labels: ["Design", "Frontend"],
        assignees: ["JD", "SM"],
        comments: 12,
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      {
        id: "7",
        title: "Setup CI/CD pipeline",
        description: "Automated testing and deployment",
        labels: ["DevOps"],
        assignees: ["TK"],
        comments: 4,
      },
      {
        id: "8",
        title: "Create design system",
        description: "Component library and guidelines",
        labels: ["Design"],
        assignees: ["JD"],
        comments: 15,
      },
    ],
  },
];

export default function BoardPage() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const card = columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeCardId = active.id;
    const overColumnId = over.id;

    // Find source column and card
    let sourceColumn: ColumnType | undefined;
    let cardToMove: CardType | undefined;

    for (const col of columns) {
      const card = col.cards.find((c) => c.id === activeCardId);
      if (card) {
        sourceColumn = col;
        cardToMove = card;
        break;
      }
    }

    if (!sourceColumn || !cardToMove) {
      setActiveCard(null);
      return;
    }

    // Find target column
    const targetColumn = columns.find(
      (col) =>
        col.id === overColumnId || col.cards.some((c) => c.id === over.id),
    );

    if (!targetColumn) {
      setActiveCard(null);
      return;
    }

    // If same column, do nothing
    if (sourceColumn.id === targetColumn.id) {
      setActiveCard(null);
      return;
    }

    // Move card
    setColumns((prevColumns) => {
      return prevColumns.map((col) => {
        if (col.id === sourceColumn.id) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== activeCardId),
          };
        }
        if (col.id === targetColumn.id) {
          return {
            ...col,
            cards: [...col.cards, cardToMove],
          };
        }
        return col;
      });
    });

    setActiveCard(null);
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };

  const handleAddCard = (columnId: string) => {
    const newCard: CardType = {
      id: Date.now().toString(),
      title: "New Task",
      description: "",
      labels: [],
      assignees: [],
      comments: 0,
    };

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col,
      ),
    );
  };

  const handleUpdateCard = (updatedCard: CardType) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card,
        ),
      })),
    );
    setSelectedCard(updatedCard);
  };

  const handleDeleteCard = () => {
    if (!selectedCard) return;

    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== selectedCard.id),
      })),
    );
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
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
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    T
                  </span>
                </div>
                <span className="text-xl font-bold">Boardly</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Star
              </Button>
              <Button variant="ghost" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Product Roadmap</h1>
            <div className="flex -space-x-2"></div>
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="p-6 overflow-x-auto bg-black">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-6 min-h-[calc(100vh-200px)]">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
                onCardClick={(card) => setSelectedCard(card)}
              />
            ))}

            {/* Add Column Button */}
            <div className="flex-shrink-0 w-80">
              <button className="w-full border border-dashed border-border rounded-lg p-4 bg-card/30 hover:bg-card/50 hover:border-primary/50 transition-all duration-300 flex items-center justify-center gap-2 group">
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  Add Column
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
