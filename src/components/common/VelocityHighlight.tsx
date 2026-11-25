"use client";

import { useCallback, useLayoutEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { computeVelocityStretch, type VelocityAxis } from "@/lib/motion/velocity-highlight";
import { cn } from "@/lib/utils";

const HIGHLIGHT_SPRING = {
  stiffness: 520,
  damping: 34,
  mass: 0.65,
} as const;

export interface VelocityHighlightProps {
  /** Active element key matching a child `[data-highlight-key]` attribute. */
  activeKey: string | null;
  children: ReactNode;
  axis?: VelocityAxis;
  maxStretch?: number;
  className?: string;
  highlightClassName?: string;
}

interface HighlightBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function measureTarget(container: HTMLElement, activeKey: string): HighlightBounds | null {
  const candidates = container.querySelectorAll<HTMLElement>("[data-highlight-key]");
  let target: HTMLElement | null = null;
  for (const el of candidates) {
    if (el.dataset.highlightKey === activeKey) {
      target = el;
      break;
    }
  }
  if (!target) return null;

  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  return {
    x: targetRect.left - containerRect.left + container.scrollLeft - container.clientLeft,
    y: targetRect.top - containerRect.top + container.scrollTop - container.clientTop,
    width: targetRect.width,
    height: targetRect.height,
  };
}

/**
 * Wraps interactive controls (nav links, tabs, or filter pills) and tracks the element
 * matching `activeKey` with a spring highlight that stretches along its travel axis.
 */
export function VelocityHighlight({
  activeKey,
  children,
  axis = "auto",
  maxStretch = 0.36,
  className,
  highlightClassName,
}: VelocityHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAnimatedKeyRef = useRef<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const targetW = useMotionValue(0);
  const targetH = useMotionValue(0);

  const xSpring = useSpring(targetX, HIGHLIGHT_SPRING);
  const ySpring = useSpring(targetY, HIGHLIGHT_SPRING);
  const wSpring = useSpring(targetW, HIGHLIGHT_SPRING);
  const hSpring = useSpring(targetH, HIGHLIGHT_SPRING);
  const opacityMV = useMotionValue(0);

  const vx = useVelocity(xSpring);
  const vy = useVelocity(ySpring);
  const vw = useVelocity(wSpring);
  const vh = useVelocity(hSpring);

  const stretchX = useTransform([vx, vy, vw, vh], (values) => {
    const [vxVal = 0, vyVal = 0, vwVal = 0, vhVal = 0] = values as number[];
    // Include size-edge velocity so shrinking/expanding items still kick along the travel axis
    return computeVelocityStretch(
      Math.abs(vxVal) + Math.abs(vwVal) * 0.45,
      Math.abs(vyVal) + Math.abs(vhVal) * 0.45,
      { axis, maxStretch }
    ).scaleX;
  });

  const stretchY = useTransform([vx, vy, vw, vh], (values) => {
    const [vxVal = 0, vyVal = 0, vwVal = 0, vhVal = 0] = values as number[];
    return computeVelocityStretch(
      Math.abs(vxVal) + Math.abs(vwVal) * 0.45,
      Math.abs(vyVal) + Math.abs(vhVal) * 0.45,
      { axis, maxStretch }
    ).scaleY;
  });

  const syncBounds = useCallback(
    (animateChange: boolean) => {
      const container = containerRef.current;
      if (!container || activeKey === null) {
        opacityMV.set(0);
        lastAnimatedKeyRef.current = null;
        return;
      }

      const bounds = measureTarget(container, activeKey);
      if (!bounds || bounds.width === 0 || bounds.height === 0) {
        opacityMV.set(0);
        lastAnimatedKeyRef.current = null;
        return;
      }

      const shouldSnap =
        !animateChange || prefersReducedMotion || lastAnimatedKeyRef.current === null;

      if (shouldSnap) {
        targetX.jump(bounds.x);
        targetY.jump(bounds.y);
        targetW.jump(bounds.width);
        targetH.jump(bounds.height);
        xSpring.jump(bounds.x);
        ySpring.jump(bounds.y);
        wSpring.jump(bounds.width);
        hSpring.jump(bounds.height);
      } else {
        targetX.set(bounds.x);
        targetY.set(bounds.y);
        targetW.set(bounds.width);
        targetH.set(bounds.height);
      }

      opacityMV.set(1);
      lastAnimatedKeyRef.current = activeKey;
    },
    [
      activeKey,
      hSpring,
      opacityMV,
      prefersReducedMotion,
      targetH,
      targetW,
      targetX,
      targetY,
      wSpring,
      xSpring,
      ySpring,
    ]
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set imperatively to hand off SSR fallback styling to Motion without triggering re-render cascades
    container.dataset.hlReady = "true";

    const keyChanged = activeKey !== lastAnimatedKeyRef.current;
    syncBounds(keyChanged);

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      syncBounds(false);
    });
    observer.observe(container);

    if (activeKey !== null) {
      for (const el of container.querySelectorAll<HTMLElement>("[data-highlight-key]")) {
        if (el.dataset.highlightKey === activeKey) {
          observer.observe(el);
          break;
        }
      }
    }

    return () => observer.disconnect();
  }, [activeKey, syncBounds]);

  return (
    <div ref={containerRef} data-vh-container="" className={cn("relative", className)}>
      <motion.span
        aria-hidden="true"
        style={{
          x: xSpring,
          y: ySpring,
          width: wSpring,
          height: hSpring,
          scaleX: prefersReducedMotion ? 1 : stretchX,
          scaleY: prefersReducedMotion ? 1 : stretchY,
          opacity: opacityMV,
          transformOrigin: "center center",
        }}
        className={cn(
          "bg-accent pointer-events-none absolute top-0 left-0 z-0 rounded-lg will-change-transform",
          highlightClassName
        )}
      />
      {children}
    </div>
  );
}
