"use client";

import { type PointerEvent, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import {
  getNextHeroSlideIndex,
  HERO_SLIDE_INTERVAL_MS,
  HERO_SLIDES,
} from "@/lib/motion/hero-slides";
import { cn } from "@/lib/utils";

const TILT_SPRING = { stiffness: 220, damping: 24, mass: 0.6 } as const;

export function HeroVisual() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, TILT_SPRING);
  const rotateY = useSpring(rotateYTarget, TILT_SPRING);

  useEffect(() => {
    // Pre-cache remaining slides cleanly in the background after initial paint
    for (const slide of HERO_SLIDES.slice(1)) {
      const preloader = new window.Image();
      preloader.src = slide.src;
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => getNextHeroSlideIndex(prev, HERO_SLIDES.length));
    }, HERO_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, activeIndex]);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rotateXTarget.set(-ny * 4.5);
    rotateYTarget.set(nx * 5);
  }

  function handlePointerLeave() {
    rotateXTarget.set(0);
    rotateYTarget.set(0);
  }

  const activeSlide = HERO_SLIDES[activeIndex] ?? HERO_SLIDES[0]!;

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto w-full max-w-[540px] lg:-mr-4 lg:max-w-none xl:-mr-10"
    >
      {/* Ambient emerald-teal bloom behind the artwork matching dark edge tones */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 hidden rounded-full bg-[radial-gradient(circle_at_52%_50%,rgba(49,156,120,0.28)_0%,rgba(22,70,74,0.22)_46%,transparent_76%)] blur-2xl sm:-inset-6 lg:block"
      />

      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformPerspective: 1200,
        }}
        className="relative aspect-[1800/1344] w-full overflow-hidden rounded-2xl bg-[#081921] shadow-[0_18px_48px_rgba(8,21,29,0.38)] ring-1 ring-white/20 will-change-transform sm:rounded-3xl lg:shadow-[0_24px_60px_rgba(8,21,29,0.5)]"
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={activeSlide.id}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.84 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            transition={{
              duration: prefersReducedMotion ? 0.15 : 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={activeSlide.src}
              alt={activeSlide.alt}
              fill
              priority={activeIndex === 0}
              sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, (min-width: 640px) 540px, 94vw"
              className="object-cover object-center select-none"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Subtle slide indicators below the frame (zero overlap with artwork) */}
      <div className="mt-3 flex items-center justify-center gap-2 lg:justify-end">
        {HERO_SLIDES.map((slide, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Show slide ${idx + 1}: ${slide.label}`}
              aria-current={isCurrent ? "true" : undefined}
              className="group inline-flex min-h-6 items-center px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  isCurrent
                    ? "bg-brand-green w-6 lg:bg-emerald-400"
                    : "bg-brand-navy/25 group-hover:bg-brand-navy/45 w-2 lg:bg-white/30 lg:group-hover:bg-white/60"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
