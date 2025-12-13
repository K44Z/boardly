"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AnimatedThemeToggler({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = theme === "dark" ? "light" : "dark";

    // @ts-ignore
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const endRadius = Math.hypot(x, y);

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("rounded-full", className)}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
