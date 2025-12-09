"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Star, Clock, Users, MoreVertical, Pencil, Trash2, TrendingUp } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { api, type Board, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { parseJwt } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BoardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editBoardName, setEditBoardName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { logout, token } = useAuth();
  const { toast } = useToast();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    fetchBoards();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    if (!token) return;
    const decoded = parseJwt(token);
    // The JWT uses 'sub' for the user ID
    const userId = decoded?.sub || decoded?.id;
    
    if (decoded && userId) {
      try {
        const response = await api.getUserById(userId);
        if (response.data?.user) {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    }
  };

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const response = await api.getBoards();
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      if (response.data?.boards) {
        setBoards(response.data.boards);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch boards",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    setIsCreating(true);
    try {
      const response = await api.createBoard({ name: newBoardName });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Board created successfully!",
      });

      setShowCreateModal(false);
      setNewBoardName("");
      fetchBoards(); 
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create board",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditBoard = (board: Board, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBoard(board);
    setEditBoardName(board.name);
    setShowEditModal(true);
  };

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard || !editBoardName.trim()) return;

    setIsUpdating(true);
    try {
      const response = await api.updateBoard(editingBoard.id, { name: editBoardName });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Board updated successfully!",
      });

      setShowEditModal(false);
      setEditingBoard(null);
      setEditBoardName("");
      fetchBoards();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update board",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBoard = (board: Board, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingBoard(board);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBoard = async () => {
    if (!deletingBoard) return;

    setIsDeleting(true);
    try {
      const response = await api.deleteBoard(deletingBoard.id);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Board deleted successfully!",
      });

      setShowDeleteDialog(false);
      setDeletingBoard(null);
      fetchBoards();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete board",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const starredBoards = filteredBoards.filter((board) => false); // TODO: Add starring feature
  const recentBoards = filteredBoards;

  // Generate avatar colors based on username
  const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-500';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              Your Boards
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {/* Recent Boards */}
        {!isLoading && recentBoards.length > 0 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentBoards.map((board, index) => (
                <div
                  key={board.id}
                  className="group relative"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <div className="border border-border rounded-lg p-6 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 h-full group-hover:scale-[1.02] group-hover:shadow-lg relative cursor-pointer overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Blur overlay when dropdown is open */}
                    {openDropdownId === board.id && (
                      <div className="absolute inset-0 backdrop-blur-sm bg-black/20 z-[5] pointer-events-none transition-all duration-200" />
                    )}
                    
                    <Link href={`/board/${board.id}`} className="absolute inset-0 z-[1]">
                      <span className="sr-only">View {board.name}</span>
                    </Link>
                    
                    <div className="flex items-start justify-between mb-4 relative">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {board.name}
                      </h3>
                      <DropdownMenu 
                        open={openDropdownId === board.id}
                        onOpenChange={(open) => setOpenDropdownId(open ? board.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <button
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent rounded-md flex items-center justify-center relative z-[2]"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="z-[100]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBoard(board, e);
                              setOpenDropdownId(null);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBoard(board, e);
                              setOpenDropdownId(null);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="relative space-y-3">
                      {/* Member Avatars */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex -space-x-2">
                          {(board.members || []).slice(0, 3).map((member, idx) => (
                            <div
                              key={idx}
                              className={`w-8 h-8 rounded-full ${getAvatarColor(member.username)} border-2 border-card flex items-center justify-center text-xs font-semibold text-white shadow-sm overflow-hidden`}
                              title={member.username}
                            >
                              {member.profile_image ? (
                                <img src={member.profile_image} alt={member.username} className="w-full h-full object-cover" />
                              ) : (
                                member.username.charAt(0).toUpperCase()
                              )}
                            </div>
                          ))}
                          {(board.members || []).length > 3 && (
                            <div
                              className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-semibold text-muted-foreground shadow-sm"
                              title={`${(board.members || []).length - 3} more`}
                            >
                              +{(board.members || []).length - 3}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(board.members || []).length} {(board.members || []).length === 1 ? 'member' : 'members'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(board.created_at).toLocaleDateString()}
                        </div>
                        {board.member_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredBoards.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No boards found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search or create a new board" : "Create your first board to get started"}
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
          style={{ position: 'fixed' }}
        >
          <div
            className="w-full max-w-md border border-border rounded-xl p-8 bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Create new board</h2>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Board name
                </label>
                <Input
                  placeholder="e.g., Product Roadmap"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  required
                  className="bg-background border-border"
                  disabled={isCreating}
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    "Create Board"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Board Modal */}
      {showEditModal && editingBoard && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setShowEditModal(false)}
          style={{ position: 'fixed' }}
        >
          <div
            className="w-full max-w-md border border-border rounded-xl p-8 bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Edit board</h2>
            <form onSubmit={handleUpdateBoard} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Board name
                </label>
                <Input
                  placeholder="e.g., Product Roadmap"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  required
                  className="bg-background border-border"
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    "Update Board"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the board &quot;{deletingBoard?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBoard}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </ProtectedRoute>
  );
}
