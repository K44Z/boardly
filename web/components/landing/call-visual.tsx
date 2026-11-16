"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { label } from "./theme";
import { cn } from "@/lib/utils";

const people = [
  { name: "Alice", img: "/user-1.jpg" },
  { name: "Bob", img: "/user-2.jpg" },
  { name: "Charlie", img: "/user-3.jpg" },
];

const bars = [0.4, 0.8, 0.55, 1, 0.6, 0.85, 0.45];

function Wave({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-5 items-center gap-[3px]", className)}>
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] animate-wave rounded-full bg-[var(--paper)]/80"
          style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

function Rings() {
  return (
    <>
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-[var(--paper)]/50"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 1.7, opacity: [0, 0.6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 1.1, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

const fade = {
  initial: { opacity: 0, filter: "blur(4px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
  transition: { duration: 0.25 },
};

// A call as a dynamic island: it rests as a small pill, then grows to show the participants.
export function CallVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(true);
  const [seconds, setSeconds] = useState(42);
  const [speaker, setSpeaker] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    const s = setInterval(() => setSpeaker((n) => (n + 1) % people.length), 2500);
    return () => {
      clearInterval(t);
      clearInterval(s);
    };
  }, [inView, reduce]);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = setTimeout(() => setExpanded((e) => !e), expanded ? 5500 : 2600);
    return () => clearTimeout(id);
  }, [inView, reduce, expanded]);

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const current = people[speaker];

  return (
    <div ref={ref} className="flex h-[232px] items-center justify-center">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        style={{ borderRadius: expanded ? 36 : 28 }}
        className="overflow-hidden bg-[var(--ink)] text-[var(--paper)] shadow-[0_20px_40px_-20px_rgba(43,43,40,0.6)]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {expanded ? (
            <motion.div key="open" {...fade} className="flex w-[300px] max-w-full flex-col gap-5 p-5">
              <div className="flex items-center justify-between">
                <span className={cn(label, "tabular-nums")}>Live · {time}</span>
                <Wave />
              </div>
              <div className="flex justify-around">
                {people.map((p, i) => (
                  <div key={p.name} className="flex flex-col items-center gap-2">
                    <div className="relative size-12">
                      {speaker === i && <Rings />}
                      <Image
                        src={p.img}
                        alt={p.name}
                        width={48}
                        height={48}
                        className={cn(
                          "relative size-12 rounded-full object-cover grayscale transition-opacity duration-500",
                          speaker === i ? "opacity-100" : "opacity-45",
                        )}
                      />
                    </div>
                    <span className={cn(label, "text-[10px] opacity-70")}>{p.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="closed" {...fade} className="flex h-14 items-center gap-4 pl-3 pr-5">
              <Image
                src={current.img}
                alt={current.name}
                width={32}
                height={32}
                className="size-8 rounded-full object-cover grayscale"
              />
              <Wave />
              <span className={cn(label, "tabular-nums")}>{time}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
