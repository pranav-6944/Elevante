"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useState, useSyncExternalStore } from "react";
import { HeroFallbackGraphic } from "./HeroFallbackGraphic";

const HeroSceneCanvas = dynamic(() => import("./HeroSceneCanvas"), {
  ssr: false,
  loading: () => <HeroFallbackGraphic />,
});

interface BoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

let cachedWebGLSupport: boolean | null = null;

function hasWebGLSupport(): boolean {
  if (cachedWebGLSupport !== null) {
    return cachedWebGLSupport;
  }
  try {
    const canvas = document.createElement("canvas");
    cachedWebGLSupport = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    cachedWebGLSupport = false;
  }
  return cachedWebGLSupport;
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getClient3DCapability(): boolean {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return !prefersReducedMotion && hasWebGLSupport();
}

export function HeroVisual() {
  const [webglLost, setWebglLost] = useState(false);
  const canRender3D = useSyncExternalStore(
    subscribeReducedMotion,
    getClient3DCapability,
    () => false
  );

  if (!canRender3D || webglLost) {
    return (
      <div className="h-[320px] w-full sm:h-[380px]">
        <HeroFallbackGraphic />
      </div>
    );
  }

  return (
    <div className="border-border/80 bg-card/80 relative h-[320px] w-full overflow-hidden rounded-3xl border shadow-sm sm:h-[380px]">
      <div
        aria-hidden="true"
        className="bg-brand-green/15 pointer-events-none absolute -top-24 -right-24 size-64 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="bg-brand-navy/15 pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full blur-3xl"
      />
      <WebGLErrorBoundary fallback={<HeroFallbackGraphic />}>
        <HeroSceneCanvas onWebGLError={() => setWebglLost(true)} />
      </WebGLErrorBoundary>
      <div className="bg-card/90 pointer-events-none absolute right-4 bottom-4 left-4 flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs backdrop-blur">
        <span className="font-heading text-foreground font-semibold">
          ELEVANTE 3D &amp; Web Studio
        </span>
        <span className="text-muted-foreground">Interactive WebGL</span>
      </div>
    </div>
  );
}
