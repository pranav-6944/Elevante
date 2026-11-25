"use client";

import type { PointerEvent } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

const TILT_SPRING = { stiffness: 220, damping: 24, mass: 0.6 } as const;

export function HeroVisual() {
  const prefersReducedMotion = useReducedMotion();
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, TILT_SPRING);
  const rotateY = useSpring(rotateYTarget, TILT_SPRING);

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

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto w-full max-w-[600px] lg:-mr-4 lg:max-w-none xl:-mr-10"
    >
      {/* Ambient emerald-teal bloom behind the artwork matching edge vignette hues */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 hidden rounded-full bg-[radial-gradient(circle_at_52%_50%,rgba(49,156,120,0.26)_0%,rgba(22,70,74,0.22)_46%,transparent_76%)] blur-2xl lg:block"
      />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformPerspective: 1200,
        }}
        className="relative overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(8,21,29,0.45)] ring-1 ring-white/15 will-change-transform"
      >
        <Image
          src="/images/hero-studio.webp"
          alt="ELEVANTE Product Studio showcase featuring multi-stack dashboards, workflow orchestration, AI graph architecture, and brand design"
          width={1800}
          height={1344}
          priority
          sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 100vw"
          className="h-auto w-full rounded-3xl object-contain select-none"
        />
      </motion.div>
    </div>
  );
}
