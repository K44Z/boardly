"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { label } from "./theme";
import { cn } from "@/lib/utils";

// [word, kept in the summary]
const text: [string, boolean][] = (
  "We~ met~ on~ Thursday~ to~ go~ over~ the~ launch~ and,~ after~ a~ long~ discussion~ about~ pricing~ and~ the~ timeline,~ agreed~ that~ " +
  "Alice+ will+ finish+ the+ design+ system+ by+ Friday.+ Bob+ moves+ the+ API+ work~ to+ next+ sprint.+ " +
  "Everyone~ was~ happy~ with~ the~ plan."
)
  .split(" ")
  .map((w) => [w.slice(0, -1), w.endsWith("+")]);

// A long card thread condenses, word by word, into the short summary it contains.
export function SummaryVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [short, setShort] = useState(!!reduce);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = setTimeout(() => setShort((s) => !s), short ? 3600 : 3800);
    return () => clearTimeout(id);
  }, [inView, reduce, short]);

  let dropped = 0;

  return (
    <div ref={ref} className="flex h-[232px] flex-col justify-between">
      <p className="text-[19px] leading-[1.35]">
        {text.map(([word, keep], i) => {
          const gone = short && !keep;
          const order = gone ? dropped++ : 0;
          return (
            <motion.span
              key={i}
              className={cn(
                "inline-block whitespace-nowrap align-bottom",
                keep ? "text-[var(--ink)]" : "text-[var(--ink)]/55",
              )}
              initial={false}
              animate={{
                width: gone ? 0 : "auto",
                marginRight: gone ? 0 : "0.28em",
                opacity: gone ? 0 : 1,
              }}
              style={{ overflow: "hidden" }}
              transition={{
                duration: reduce ? 0 : 0.55,
                delay: reduce ? 0 : order * 0.025,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          );
        })}
      </p>
      <div className={cn(label, "flex items-center justify-between text-[var(--muted)]")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={short ? "s" : "l"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {short ? "Summary · 2 lines" : "Card thread · 14 comments"}
          </motion.span>
        </AnimatePresence>
        <span className="text-[var(--ink)]">{short ? "✦" : "…"}</span>
      </div>
    </div>
  );
}
