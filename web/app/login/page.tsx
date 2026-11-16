"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/landing/auth-shell";
import { authButton, authInput, label } from "@/components/landing/theme";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.login(formData);

      if (response.error) {
        toast({
          title: "Error",
          description: "Incorrect Password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (response.data?.token) {
        login(response.data.token);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        router.push("/boards");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue."
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="border-b border-[var(--ink)]/30 hover:border-[var(--ink)]">
            Begin one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className={label}>Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className={authInput}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className={label}>Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className={authInput}
          />
        </div>
        <Button type="submit" className={authButton} disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
