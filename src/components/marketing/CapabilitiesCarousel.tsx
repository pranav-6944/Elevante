"use client";

import { type PointerEvent, useLayoutEffect, useMemo, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { CapabilityItem } from "@/lib/content/public-defaults";
import {
  isFeaturedCapability,
  splitCapabilitiesIntoTracks,
  wrapLoopOffset,
} from "@/lib/motion/capabilities-carousel";
import { cn } from "@/lib/utils";
import { CAPABILITY_ICON_MAP } from "@/components/marketing/CapabilitiesGrid";
import { Badge } from "@/components/ui/badge";

const CARD_TILT_SPRING = { stiffness: 280, damping: 22, mass: 0.5 } as const;
const TRACK_COPIES = [0, 1, 2] as const;

function CapabilityCard3D({ item }: { item: CapabilityItem }) {
  const Icon = CAPABILITY_ICON_MAP[item.iconKey];
  const featured = isFeaturedCapability(item.id);
  const prefersReducedMotion = useReducedMotion();

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, CARD_TILT_SPRING);
  const rotateY = useSpring(tiltY, CARD_TILT_SPRING);

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    if (prefersReducedMotion || e.pointerType !== "mouse") return;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const intensity = isMobile ? 2 : 5.5;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(-ny * intensity);
    tiltY.set(nx * intensity);
  }

  function handlePointerLeave() {
    tiltX.set(0);
    tiltY.set(0);
  }

  return (
    <motion.article
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
        transformPerspective: 900,
      }}
      className={cn(
        "group/card relative flex w-[290px] shrink-0 snap-start flex-col justify-between rounded-2xl border p-5 pt-6 transition-[translate,box-shadow,border-color] duration-300 will-change-transform select-none hover:-translate-y-2 md:w-[348px]",
        featured
          ? "border-b-[6px] border-emerald-400/35 border-b-[#0a2329] bg-gradient-to-br from-[#17264F] via-[#1B3A4B] to-[#134E4A] text-white shadow-[0_18px_36px_-10px_rgba(19,78,74,0.52),0_0_24px_rgba(52,211,153,0.16)] hover:border-emerald-300/60 hover:shadow-[0_26px_48px_-10px_rgba(16,185,129,0.34),0_0_32px_rgba(139,92,246,0.24)]"
          : "text-foreground border-b-[6px] border-emerald-500/20 border-b-[#98cbbd] bg-white/85 shadow-[0_14px_28px_-10px_rgba(23,38,79,0.13),0_4px_12px_-4px_rgba(49,156,120,0.12)] backdrop-blur-md hover:border-emerald-500/45 hover:border-b-[#5ab59c] hover:shadow-[0_24px_42px_-12px_rgba(49,156,120,0.28),0_0_24px_rgba(49,156,120,0.16)]"
      )}
    >
      {/* Subtle internal glow accent */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-2xl",
          featured
            ? "bg-[radial-gradient(circle_at_85%_15%,rgba(52,211,153,0.18),transparent_48%),radial-gradient(circle_at_15%_85%,rgba(139,92,246,0.18),transparent_48%)]"
            : "bg-[radial-gradient(circle_at_90%_12%,rgba(49,156,120,0.1),transparent_52%)]"
        )}
      />

      {/* Top row: overlapping 3D icon badge + category tag */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div
          className={cn(
            "-mt-10 flex size-13 items-center justify-center rounded-2xl border border-b-4 transition-all duration-300 group-hover/card:-translate-y-1.5 group-hover/card:scale-105 sm:size-14",
            featured
              ? "border-white/30 border-b-indigo-950/60 bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-500 text-white shadow-[0_12px_24px_rgba(52,211,153,0.42)] group-hover/card:shadow-[0_16px_30px_rgba(139,92,246,0.45)]"
              : "border-emerald-400/40 border-b-emerald-600/35 bg-gradient-to-br from-[#e7f8f2] via-white to-[#cdeee2] text-[#17264F] shadow-[0_10px_20px_rgba(49,156,120,0.24)] group-hover/card:shadow-[0_14px_26px_rgba(49,156,120,0.34)]"
          )}
        >
          <Icon className="size-6 sm:size-7" aria-hidden="true" />
        </div>

        <Badge
          variant="outline"
          className={cn(
            "shrink-0 rounded-full text-[11px] font-medium whitespace-nowrap",
            featured
              ? "border-emerald-300/35 bg-white/10 text-emerald-100"
              : "border-emerald-500/25 bg-emerald-50/70 text-[#245B70]"
          )}
        >
          {item.category}
        </Badge>
      </div>

      {/* Card copy */}
      <div className="relative z-10 mt-4 space-y-2">
        <h3
          className={cn(
            "font-heading text-lg font-bold tracking-tight",
            featured ? "text-white" : "text-[#17264F]"
          )}
        >
          {item.title}
        </h3>
        <p
          className={cn(
            "text-xs leading-relaxed sm:text-sm",
            featured ? "text-emerald-50/85" : "text-muted-foreground"
          )}
        >
          {item.description}
        </p>
      </div>
    </motion.article>
  );
}

interface MarqueeTrackProps {
  items: CapabilityItem[];
  direction: "ltr" | "rtl";
  speedPxPerSec?: number;
  label: string;
}

function MarqueeTrack({ items, direction, speedPxPerSec = 36, label }: MarqueeTrackProps) {
  const prefersReducedMotion = useReducedMotion();
  const trackX = useMotionValue(0);
  const groupRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef(0);
  const hoveredRef = useRef(false);
  const draggingRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });
  const resumeAtRef = useRef(0);

  useLayoutEffect(() => {
    const groupEl = groupRef.current;
    if (!groupEl || prefersReducedMotion) return;

    const updatePeriod = () => {
      const nextPeriod = groupEl.offsetWidth;
      if (!nextPeriod) return;
      const prevPeriod = periodRef.current;
      periodRef.current = nextPeriod;

      if (prevPeriod === 0) {
        trackX.set(direction === "ltr" ? -nextPeriod : 0);
      } else {
        trackX.set(wrapLoopOffset(trackX.get(), nextPeriod));
      }
    };

    updatePeriod();
    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(updatePeriod);
    ro.observe(groupEl);
    return () => ro.disconnect();
  }, [direction, prefersReducedMotion, trackX]);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion) return;
    const period = periodRef.current;
    if (!period || hoveredRef.current || draggingRef.current.active) return;
    if (performance.now() < resumeAtRef.current) return;

    const clampedDeltaSec = Math.min(delta, 50) / 1000;
    const step = speedPxPerSec * clampedDeltaSec * (direction === "ltr" ? 1 : -1);
    trackX.set(wrapLoopOffset(trackX.get() + step, period));
  });

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion || e.pointerType === "mouse") return;
    draggingRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !draggingRef.current.active) return;
    const dx = e.clientX - draggingRef.current.lastX;
    const dy = e.clientY - draggingRef.current.lastY;
    draggingRef.current.lastX = e.clientX;
    draggingRef.current.lastY = e.clientY;

    // Only scrub horizontally when touch intent is predominantly horizontal
    if (Math.abs(dx) > Math.abs(dy) && periodRef.current > 0) {
      trackX.set(wrapLoopOffset(trackX.get() + dx, periodRef.current));
    }
  }

  function handlePointerEnd() {
    if (!draggingRef.current.active) return;
    draggingRef.current.active = false;
    resumeAtRef.current = performance.now() + 1400;
  }

  if (prefersReducedMotion) {
    return (
      <div
        role="region"
        aria-label={label}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pt-8 pb-5 sm:px-6"
      >
        {items.map((item) => (
          <CapabilityCard3D key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={label}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      onFocus={() => {
        hoveredRef.current = true;
      }}
      onBlur={() => {
        hoveredRef.current = false;
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className="relative touch-pan-y overflow-hidden md:[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] md:[-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
    >
      <motion.div
        style={{ x: trackX }}
        className="flex w-max items-stretch py-7 will-change-transform sm:py-8"
      >
        {TRACK_COPIES.map((copyIndex) => (
          <div
            key={copyIndex}
            ref={copyIndex === 0 ? groupRef : undefined}
            aria-hidden={copyIndex > 0 ? true : undefined}
            className="flex shrink-0 items-stretch gap-5 pr-5 sm:gap-6 sm:pr-6"
          >
            {items.map((item) => (
              <CapabilityCard3D key={`${copyIndex}-${item.id}`} item={item} />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function CapabilitiesCarousel({ items }: { items: CapabilityItem[] }) {
  const { row1, row2 } = useMemo(() => splitCapabilitiesIntoTracks(items), [items]);

  return (
    <div className="space-y-3 [perspective:1200px]">
      <div className="origin-center md:[transform:rotateX(3deg)]">
        <MarqueeTrack
          items={row1}
          direction="ltr"
          speedPxPerSec={34}
          label="Core engineering and data capabilities row"
        />
      </div>
      <div className="origin-center md:[transform:rotateX(3deg)]">
        <MarqueeTrack
          items={row2}
          direction="rtl"
          speedPxPerSec={38}
          label="Applied AI, automation, and brand design capabilities row"
        />
      </div>
    </div>
  );
}
