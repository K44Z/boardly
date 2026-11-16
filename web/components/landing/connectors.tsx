"use client";

import { forwardRef, useRef, type ReactNode } from "react";
import Image from "next/image";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { cn } from "@/lib/utils";

const Node = forwardRef<HTMLDivElement, { className?: string; children: ReactNode }>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-14 items-center justify-center rounded-full border border-[var(--ink)]/20 bg-[var(--paper)] p-2.5",
        className,
      )}
    >
      {children}
    </div>
  ),
);
Node.displayName = "Node";

const logo = (src: string, alt: string) => (
  <Image src={src} alt={alt} width={36} height={36} className="size-full rounded-full object-cover grayscale" />
);

// Same layout as the old landing's beam, restyled with hairlines and paper circles.
export function Connectors({ className }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const github = useRef<HTMLDivElement>(null);
  const obsidian = useRef<HTMLDivElement>(null);
  const center = useRef<HTMLDivElement>(null);
  const ms = useRef<HTMLDivElement>(null);
  const notion = useRef<HTMLDivElement>(null);
  const radix = useRef<HTMLDivElement>(null);

  const beam = {
    containerRef: box,
    toRef: center,
    pathColor: "#2b2b28",
    pathWidth: 1,
    pathOpacity: 0.25,
    gradientStartColor: "#2b2b28",
    gradientStopColor: "#c9a57a",
  };

  return (
    <div ref={box} className={cn("relative flex h-[420px] items-center justify-between px-2 md:px-10", className)}>
      <div className="flex h-full flex-col justify-between py-4">
        <Node ref={canvas}>{logo("/canvas.png", "Canvas")}</Node>
        <Node ref={github}>{logo("/github.png", "GitHub")}</Node>
        <Node ref={obsidian}>{logo("/obsidian.jpg", "Obsidian")}</Node>
      </div>
      <Node ref={center} className="size-20 p-4">
        {logo("/boardly-mark.svg", "Boardly")}
      </Node>
      <div className="flex h-full flex-col justify-between py-4">
        <Node ref={ms}>{logo("/microsoft.jpg", "Microsoft 365")}</Node>
        <Node ref={notion}>{logo("/notion.png", "Notion")}</Node>
        <Node ref={radix}>{logo("/slack.png", "Slack")}</Node>
      </div>

      <AnimatedBeam {...beam} fromRef={canvas} curvature={-60} />
      <AnimatedBeam {...beam} fromRef={github} />
      <AnimatedBeam {...beam} fromRef={obsidian} curvature={60} />
      <AnimatedBeam {...beam} fromRef={ms} curvature={-60} reverse />
      <AnimatedBeam {...beam} fromRef={notion} reverse />
      <AnimatedBeam {...beam} fromRef={radix} curvature={60} reverse />
    </div>
  );
}
