import Link from "next/link";
import type { ReactNode } from "react";
import { Landscape, type ArtKey } from "./landscape";
import { Reveal } from "./motion";
import { label, themeClass, themeStyle } from "./theme";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  subtitle,
  art = "hero",
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  art?: ArtKey;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className={cn(themeClass, "grid md:grid-cols-[1fr_1.1fr]")} style={themeStyle}>
      <div className="relative hidden md:block">
        <Landscape art={art} className="absolute inset-0" />
        <Link
          href="/"
          className="absolute left-10 top-8 z-10 text-2xl font-medium tracking-wide"
        >
          Boardly
        </Link>
        <p className="absolute bottom-12 left-10 right-10 z-10 max-w-xs rounded-sm bg-[var(--paper)]/80 p-4 backdrop-blur-sm text-3xl font-light italic leading-tight">
          Boards hold lists. Lists hold cards.
        </p>
      </div>

      <div className="flex min-h-screen flex-col px-6 py-8 md:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" className={cn(label, "transition-opacity hover:opacity-60")}>
            ← Home
          </Link>
          <Link href="/" className="text-2xl font-medium tracking-wide md:hidden">
            Boardly
          </Link>
        </div>

        <Reveal className="m-auto w-full max-w-sm py-16">
          <h1 className="mb-3 text-6xl font-light italic">{title}</h1>
          <p className="mb-12 text-xl text-[var(--ink)]/70">{subtitle}</p>
          {children}
          <p className="mt-10 text-lg text-[var(--ink)]/70">{footer}</p>
        </Reveal>
      </div>
    </div>
  );
}
