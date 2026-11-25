"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { computeScrambleFrame } from "@/lib/motion/scramble-text";
import { cn } from "@/lib/utils";

export interface ScrambleTextProps {
  text: string;
  durationMs?: number;
  tickMs?: number;
  charset?: string;
  trigger?: "inView" | "mount" | "change";
  replayOnHover?: boolean;
  className?: string;
}

/**
 * Reveals text through a timed glyph scramble that preserves spaces and locks
 * characters left-to-right. Renders exact `text` for SSR, crawlers, and reduced motion.
 */
export function ScrambleText({
  text,
  durationMs = 480,
  tickMs = 32,
  charset,
  trigger = "inView",
  replayOnHover = false,
  className,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevTextRef = useRef(text);
  const prevReplayRef = useRef(0);
  const isInView = useInView(ref, { once: true, amount: 0.35 });
  const prefersReducedMotion = useReducedMotion();

  const [replaySeed, setReplaySeed] = useState(0);
  const [frame, setFrame] = useState<{ target: string; value: string }>(() => ({
    target: text,
    value: text,
  }));

  useEffect(() => {
    const textChanged = prevTextRef.current !== text;
    const replayRequested = replaySeed !== prevReplayRef.current;
    prevTextRef.current = text;
    prevReplayRef.current = replaySeed;

    if (prefersReducedMotion || !text) return;
    if (trigger === "inView" && !isInView && !replayRequested) return;
    if (trigger === "change" && !textChanged && !replayRequested) return;

    const totalDuration = Math.max(durationMs, 1);
    let rafId = 0;
    let startTime: number | null = null;
    let lastTickTime = -tickMs;

    const step = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      if (progress >= 1) {
        setFrame({ target: text, value: text });
        return;
      }

      if (now - lastTickTime >= tickMs) {
        lastTickTime = now;
        setFrame({
          target: text,
          value: computeScrambleFrame(text, progress, { charset }),
        });
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [charset, durationMs, isInView, prefersReducedMotion, replaySeed, text, tickMs, trigger]);

  const shown = prefersReducedMotion ? text : frame.target === text ? frame.value : text;

  return (
    <span
      ref={ref}
      onMouseEnter={replayOnHover ? () => setReplaySeed((n) => n + 1) : undefined}
      className={cn("inline-block align-baseline", className)}
    >
      <span className="sr-only select-none">{text}</span>
      <span aria-hidden="true" className="tabular-nums">
        {shown}
      </span>
    </span>
  );
}

