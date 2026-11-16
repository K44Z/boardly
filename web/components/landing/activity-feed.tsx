"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { label } from "./theme";
import { cn } from "@/lib/utils";

type Item = { user: string; text: string; img: string };

const VISIBLE = 4;

// New activity slides in at the top every few seconds; the oldest drops off the bottom.
export function ActivityFeed({ items }: { items: Item[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(VISIBLE);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const shown = Array.from({ length: VISIBLE }, (_, i) => {
    const n = tick - i; // newest first
    return { n, item: items[((n % items.length) + items.length) % items.length] };
  });

  return (
    <ul
      ref={ref}
      className="relative flex h-[232px] flex-col overflow-hidden [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"
    >
      <AnimatePresence initial={false}>
        {shown.map(({ n, item }, i) => (
          <motion.li
            key={n}
            layout="position"
            initial={reduce ? false : { opacity: 0, y: -28 }}
            animate={{ opacity: 1 - i * 0.15, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex shrink-0 items-center gap-3 border-b border-[var(--ink)]/10 py-3"
          >
            <Image
              src={item.img}
              alt=""
              width={28}
              height={28}
              className="size-7 rounded-full object-cover grayscale"
            />
            <p className="flex-1 text-lg leading-tight">
              <span className="font-medium">{item.user}</span>{" "}
              <span className="text-[var(--ink)]/70">{item.text}</span>
            </p>
            <span className={cn(label, "text-[var(--muted)]")}>
              {i === 0 ? "just now" : `${i * 3}m`}
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
