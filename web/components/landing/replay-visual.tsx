"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import { label } from "./theme";
import { cn } from "@/lib/utils";

const columns = ["To do", "Doing", "Done"];
const cards = ["Design system", "API", "Auth", "Landing"];
// Column index of each card at every step in time.
const steps = [
  [0, 0, 0, 0],
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [2, 1, 0, 0],
  [2, 1, 1, 0],
  [2, 2, 1, 0],
];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const last = steps.length - 1;

// A tiny board that rewinds and replays its own week while a scrubber follows along.
export function ReplayVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? last : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = setTimeout(
      () => setStep((s) => (s === last ? 0 : s + 1)),
      step === last ? 2400 : 1300,
    );
    return () => clearTimeout(id);
  }, [inView, reduce, step]);

  const state = steps[step];

  return (
    <div ref={ref} className="flex h-[232px] flex-col justify-between">
      <LayoutGroup>
        <div className="grid flex-1 grid-cols-3 gap-3">
          {columns.map((name, c) => (
            <div key={name} className="flex flex-col gap-2 border-t border-[var(--ink)]/20 pt-2">
              <span className={cn(label, "text-[10px] text-[var(--muted)]")}>{name}</span>
              {cards.map((title, i) =>
                state[i] === c ? (
                  <motion.div
                    key={title}
                    layoutId={title}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : step === 0
                          ? { duration: 0.9, ease: [0.22, 1, 0.36, 1] } // rewind
                          : { type: "spring", stiffness: 260, damping: 28 }
                    }
                    className="border border-[var(--ink)]/20 bg-[var(--paper)] px-2.5 py-2 text-[15px] leading-tight shadow-[0_6px_14px_-10px_rgba(43,43,40,0.5)]"
                  >
                    {title}
                  </motion.div>
                ) : null,
              )}
            </div>
          ))}
        </div>
      </LayoutGroup>

      <div className="mt-4">
        <div className="relative flex h-5 items-center">
          <div className="absolute inset-x-0 h-px bg-[var(--ink)]/20" />
          <motion.div
            className="absolute left-0 h-px bg-[var(--ink)]"
            animate={{ width: `${(step / last) * 100}%` }}
            transition={{ duration: step === 0 ? 0.9 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {days.map((d, i) => (
            <button
              key={d}
              type="button"
              aria-label={`Show ${d}`}
              onClick={() => setStep(i)}
              className="absolute size-5 -translate-x-1/2 cursor-pointer"
              style={{ left: `${(i / last) * 100}%` }}
            >
              <span
                className={cn(
                  "mx-auto block size-1.5 rounded-full transition-colors",
                  i <= step ? "bg-[var(--ink)]" : "bg-[var(--ink)]/25",
                )}
              />
            </button>
          ))}
        </div>
        <div className={cn(label, "mt-2 flex justify-between text-[var(--muted)]")}>
          <span>Replay</span>
          <span className="text-[var(--ink)]">{days[step]}</span>
        </div>
      </div>
    </div>
  );
}
