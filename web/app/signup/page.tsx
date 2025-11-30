"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Success",
        description: "Account created successfully! Please log in.",
      });
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-background flex items-center justify-center p-6">
      <div className="w-full max-w-5xl animate-fade-in">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Signup form */}
          <div className="border border-border rounded-xl p-8 bg-card/50 backdrop-blur-sm">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">
                    T
                  </span>
                </div>
                <span className="text-2xl font-bold">Boardly</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-muted-foreground">
                Start organizing your work in minutes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  className="bg-background border-border focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-background border-border focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="bg-background border-border focus:border-primary transition-colors"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-foreground hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div
            className="hidden md:flex flex-col justify-center space-y-8"
            style={{ animationDelay: "0.1s" }}
          >
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Why teams choose Boardly
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">AI-Powered Insights</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get intelligent summaries and suggestions to work smarter
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      Real-time Collaboration
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      See changes instantly as your team works together
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Intuitive Interface</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Drag and drop cards with smooth, polished animations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Free to Start</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      No credit card required. Start organizing immediately
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card/30">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Boardly transformed how our team collaborates. The AI summaries
                alone save us hours every week."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold">JD</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Jane Doe</p>
                  <p className="text-xs text-muted-foreground">
                    Product Manager
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
