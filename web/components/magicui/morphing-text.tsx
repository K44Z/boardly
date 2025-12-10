"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

export function MorphingText({
  className,
  texts,
}: MorphingTextProps) {
  const textIndexRef = useRef(0);
  const morphTimeRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const morphTime = 1.5;
  const cooldownTime = 0.5;

  useEffect(() => {
    let animationFrameId: number;

    const text1 = text1Ref.current;
    const text2 = text2Ref.current;

    if (!text1 || !text2) return;

    text1.textContent = texts[textIndexRef.current % texts.length];
    text2.textContent = texts[(textIndexRef.current + 1) % texts.length];

    const doMorph = () => {
      morphTimeRef.current -= cooldownRef.current;
      cooldownRef.current = 0;

      let fraction = morphTimeRef.current / morphTime;

      if (fraction > 1) {
        cooldownRef.current = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    const setMorph = (fraction: number) => {
      text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      fraction = 1 - fraction;
      text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      text1.textContent = texts[textIndexRef.current % texts.length];
      text2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    };

    const doCooldown = () => {
      morphTimeRef.current = 0;

      text2.style.filter = "";
      text2.style.opacity = "100%";

      text1.style.filter = "";
      text1.style.opacity = "0%";
    };

    const animate = () => {
      const newTime = new Date();
      const shouldIncrementIndex = cooldownRef.current > 0;
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) {
        if (shouldIncrementIndex) {
          textIndexRef.current++;
        }

        doMorph();
      } else {
        doCooldown();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [texts]);

  return (
    <div
      className={cn(
        "relative mx-auto h-16 w-full max-w-screen-md text-center text-[40pt] font-bold leading-none [filter:url(#threshold)_blur(0.6px)] md:h-24 lg:text-[6rem]",
        className,
      )}
    >
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full opacity-0"
        ref={text2Ref}
      />

      <svg id="filters" className="hidden" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
