import type { CSSProperties } from "react";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-ui" });

// Shared by the landing, login and signup pages.
export const themeClass = cn(
  serif.variable,
  sans.variable,
  "min-h-screen bg-[var(--paper)] font-[family-name:var(--font-display)] text-[var(--ink)] antialiased",
);

export const themeStyle = {
  "--paper": "#fbfaf6",
  "--ink": "#2b2b28",
  "--muted": "#8a8a82",
} as CSSProperties;

export const label =
  "font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.22em]";

export const textLink =
  "group inline-flex items-center gap-3 border-b border-[var(--ink)]/30 pb-1 transition-colors hover:border-[var(--ink)]";

export const authInput =
  "h-12 rounded-none border-0 border-b border-[var(--ink)]/25 bg-transparent px-0 text-xl shadow-none transition-colors placeholder:text-[var(--muted)]/70 focus-visible:border-[var(--ink)] focus-visible:ring-0 md:text-xl";

export const authButton =
  "h-12 w-full rounded-none bg-[var(--ink)] font-[family-name:var(--font-ui)] text-[11px] uppercase tracking-[0.22em] text-[var(--paper)] shadow-none hover:bg-[var(--ink)]/85";
