"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, Mail, LogOut } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { api, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { parseJwt } from "@/lib/utils";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { logout, token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      
      const decoded = parseJwt(token);
      // The JWT uses 'sub' for the user ID
      const userId = decoded?.sub || decoded?.id;
      
      if (!decoded || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.getUserById(userId);
        if (response.error) {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          });
          return;
        }
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token, toast]);

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const response = await api.uploadProfileImage(file);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      if (response.data?.image_url && user) {
        setUser({ ...user, profile_image: response.data.image_url });
        toast({
          title: "Success",
          description: "Profile picture updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-transparent">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/boards" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Boards</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Boardly</span>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : user ? (
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="bg-card border border-border rounded-xl p-8">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                    <div className="relative group">
                      <div className="relative">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                          <AvatarImage src={user.profile_image} className="object-cover" />
                          <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                            {getInitials(user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <label 
                          htmlFor="profile-upload" 
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {isUploading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <span className="text-white text-xs font-medium">Change</span>
                          )}
                        </label>
                        <input 
                          id="profile-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </div>
                    </div>

                    <div className="flex-1 space-y-6 w-full text-center sm:text-left">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
                        <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </p>
                      </div>

                      <div className="grid gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</label>
                          <div className="flex items-center gap-2 mt-1">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{user.username}</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <Button 
                    variant="destructive" 
                    onClick={logout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Failed to load user profile.
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
