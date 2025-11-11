"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Star, Clock, Users } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";

const mockBoards = [
  {
    id: "1",
    name: "Product Roadmap",
    description: "Q1 2025 planning and features",
    color: "bg-primary",
    starred: true,
    lastViewed: "2 hours ago",
    members: 5,
  },
  {
    id: "2",
    name: "Marketing Campaign",
    description: "Launch strategy and content calendar",
    color: "bg-muted",
    starred: false,
    lastViewed: "1 day ago",
    members: 3,
  },
  {
    id: "3",
    name: "Design System",
    description: "Component library and guidelines",
    color: "bg-accent",
    starred: true,
    lastViewed: "3 hours ago",
    members: 4,
  },
  {
    id: "4",
    name: "Customer Feedback",
    description: "User research and feature requests",
    color: "bg-secondary",
    starred: false,
    lastViewed: "5 days ago",
    members: 2,
  },
  {
    id: "5",
    name: "Sprint Planning",
    description: "Current sprint tasks and backlog",
    color: "bg-primary",
    starred: true,
    lastViewed: "30 minutes ago",
    members: 8,
  },
  {
    id: "6",
    name: "Bug Tracking",
    description: "Issues and technical debt",
    color: "bg-muted",
    starred: false,
    lastViewed: "2 days ago",
    members: 6,
  },
];

export default function BoardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { logout } = useAuth();

  const filteredBoards = mockBoards.filter(
    (board) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const starredBoards = filteredBoards.filter((board) => board.starred);
  const recentBoards = filteredBoards.filter((board) => !board.starred);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black grid-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                T
              </span>
            </div>
            <span className="text-xl font-bold">Boardly</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Workspaces
            </Button>
            <Button variant="ghost" size="sm">
              Recent
            </Button>
            <Button variant="ghost" size="sm">
              Starred
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
              <span className="text-sm font-semibold">JD</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Boards</h1>
            <p className="text-muted-foreground">
              Organize and track all your projects in one place
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-background border-border"
              />
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        {/* Starred Boards */}
        {starredBoards.length > 0 && (
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 fill-current" />
              <h2 className="text-xl font-bold">Starred Boards</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {starredBoards.map((board, index) => (
                <Link
                  key={board.id}
                  href={`/board/${board.id}`}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="border border-border rounded-lg p-6 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer h-full group-hover:scale-[1.02] group-hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${board.color} rounded-lg`} />
                      <Star className="w-5 h-5 fill-current text-foreground" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {board.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {board.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {board.lastViewed}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {board.members}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Boards */}
        {recentBoards.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <h2 className="text-xl font-bold">Recent Boards</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentBoards.map((board, index) => (
                <Link
                  key={board.id}
                  href={`/board/${board.id}`}
                  className="group animate-fade-in"
                  style={{
                    animationDelay: `${(index + starredBoards.length) * 0.05}s`,
                  }}
                >
                  <div className="border border-border rounded-lg p-6 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer h-full group-hover:scale-[1.02] group-hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${board.color} rounded-lg`} />
                      <Star className="w-5 h-5 text-muted-foreground hover:text-foreground hover:fill-current transition-colors" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {board.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {board.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {board.lastViewed}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {board.members}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Create new board card */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="border border-dashed border-border rounded-lg p-6 bg-card/30 hover:bg-card/50 hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-3 group animate-fade-in"
                style={{
                  animationDelay: `${(recentBoards.length + starredBoards.length) * 0.05}s`,
                }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-semibold">Create new board</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredBoards.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No boards found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or create a new board
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-md border border-border rounded-xl p-8 bg-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Create new board</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowCreateModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Board name
                </label>
                <Input
                  placeholder="e.g., Product Roadmap"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description (optional)
                </label>
                <Input
                  placeholder="What's this board about?"
                  className="bg-background border-border"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Board
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
