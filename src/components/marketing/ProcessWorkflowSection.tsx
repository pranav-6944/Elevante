"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Receipt,
  Rocket,
  SearchCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ProcessStep } from "@/lib/content/public-defaults";
import { cn } from "@/lib/utils";
import { ScrambleText } from "@/components/common/ScrambleText";
import { VelocityHighlight } from "@/components/common/VelocityHighlight";
import { Reveal } from "@/components/marketing/MotionWrapper";
import { Button } from "@/components/ui/button";

const STEP_META: Record<string, { icon: LucideIcon; shortLabel: string; outcome: string }> = {
  "01": {
    icon: Compass,
    shortLabel: "01 Brief",
    outcome: "Tailored requirements & files captured cleanly",
  },
  "02": {
    icon: SearchCheck,
    shortLabel: "02 Review",
    outcome: "Architecture, constraints & timeline validated",
  },
  "03": {
    icon: Receipt,
    shortLabel: "03 Quote",
    outcome: "Itemized deliverables & pricing before build starts",
  },
  "04": {
    icon: Rocket,
    shortLabel: "04 Deliver",
    outcome: "Live tracking, revisions & verified file handoff",
  },
};

export function ProcessWorkflowSection({ stages }: { stages: readonly ProcessStep[] }) {
  const [activeStep, setActiveStep] = useState(stages[0]?.step ?? "01");
  const activeStage = stages.find((s) => s.step === activeStep) ?? stages[0];
  const activeMeta = activeStage ? STEP_META[activeStage.step] : undefined;

  return (
    <section className="relative overflow-hidden py-16 sm:py-22">
      {/* Subtle mint-teal studio aura framing the workflow section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f5f6f2] via-[#eef6f3] to-[#f5f6f2]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(49,156,120,0.09)_0%,rgba(36,91,112,0.05)_48%,transparent_72%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1cb883] to-[#239b87] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white uppercase shadow-[0_8px_20px_rgba(49,156,120,0.24)]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            <span>Process</span>
          </div>
          <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            How <span className="text-brand-gradient">ELEVANTE</span> Works
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
            A clear, structured engagement flow designed to eliminate ambiguity before development
            starts.
          </p>
        </div>

        {/* Interactive Stage Switcher with VelocityHighlight */}
        <div className="flex justify-center">
          <VelocityHighlight
            activeKey={activeStep}
            axis="auto"
            className="grid w-full max-w-md grid-cols-2 gap-1.5 rounded-2xl border border-emerald-500/20 bg-white/85 p-1.5 shadow-xs backdrop-blur-md sm:inline-flex sm:w-auto sm:max-w-none sm:rounded-full"
            highlightClassName="rounded-xl sm:rounded-full bg-brand-gradient shadow-sm"
          >
            {stages.map((stage) => {
              const isSelected = stage.step === activeStep;
              const meta = STEP_META[stage.step];
              return (
                <button
                  key={stage.step}
                  type="button"
                  data-highlight-key={stage.step}
                  aria-pressed={isSelected}
                  onClick={() => setActiveStep(stage.step)}
                  className={cn(
                    "relative z-10 min-h-9 rounded-xl px-4 py-1.5 text-xs font-semibold transition-colors duration-150 sm:rounded-full sm:text-sm",
                    isSelected
                      ? "[[data-vh-container]:not([data-hl-ready='true'])_&]:bg-brand-gradient text-white delay-75"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {meta?.shortLabel ?? `Step ${stage.step}`}
                </button>
              );
            })}
          </VelocityHighlight>
        </div>

        {/* 4-Stage Tactile 3D Cards + Connected Desktop Track */}
        <Reveal>
          <div className="relative pt-4">
            {/* Desktop connecting rail */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-11 right-16 left-16 hidden h-[2px] bg-gradient-to-r from-[#319C78]/35 via-[#245B70]/35 to-[#319C78]/35 lg:block"
            />

            <div className="grid grid-cols-1 gap-8 pt-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-5">
              {stages.map((stage) => {
                const isActive = stage.step === activeStep;
                const meta = STEP_META[stage.step];
                const Icon = meta?.icon ?? Compass;

                return (
                  <article
                    key={stage.step}
                    onClick={() => setActiveStep(stage.step)}
                    className={cn(
                      "group/step relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 pt-7 transition-all duration-300 sm:p-6 sm:pt-7",
                      isActive
                        ? "-translate-y-1.5 border-b-[6px] border-emerald-400/45 border-b-[#0a2329] bg-gradient-to-br from-[#17264F] via-[#1B3A4B] to-[#134E4A] text-white shadow-[0_22px_46px_-12px_rgba(19,78,74,0.5),0_0_26px_rgba(49,156,120,0.22)]"
                        : "text-foreground border-b-[6px] border-emerald-500/20 border-b-[#a3d1c4] bg-white/90 shadow-[0_12px_28px_-10px_rgba(23,38,79,0.12)] backdrop-blur-md hover:-translate-y-1 hover:border-emerald-500/45 hover:shadow-[0_20px_38px_-12px_rgba(49,156,120,0.22)]"
                    )}
                  >
                    {/* Top row: 3D protruding step icon badge + Step tag */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          "-mt-11 flex size-12 items-center justify-center rounded-2xl border border-b-4 transition-transform duration-300 group-hover/step:-translate-y-1",
                          isActive
                            ? "border-white/30 border-b-emerald-950/60 bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-500 text-white shadow-[0_10px_22px_rgba(52,211,153,0.4)]"
                            : "border-emerald-400/35 border-b-emerald-600/30 bg-gradient-to-br from-[#e7f8f2] via-white to-[#cdeee2] text-[#17264F] shadow-[0_8px_18px_rgba(49,156,120,0.2)]"
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </div>

                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-widest",
                          isActive
                            ? "border-emerald-300/35 bg-white/10 text-emerald-200"
                            : "border-emerald-500/25 bg-emerald-50/75 text-[#245B70]"
                        )}
                      >
                        STEP {stage.step}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mt-4 space-y-2">
                      <h3
                        className={cn(
                          "font-heading text-lg font-bold tracking-tight",
                          isActive ? "text-white" : "text-[#17264F]"
                        )}
                      >
                        {stage.title}
                      </h3>
                      <p
                        className={cn(
                          "text-xs leading-relaxed sm:text-sm",
                          isActive ? "text-emerald-50/85" : "text-muted-foreground"
                        )}
                      >
                        {stage.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Interactive Stage Outcome Bar + CTA */}
        {activeStage ? (
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#cde2dc] bg-white/85 px-5 py-4 shadow-xs backdrop-blur-md sm:flex-row sm:items-center sm:px-6">
            <div className="space-y-1">
              <p className="text-secondary font-mono text-[11px] font-bold tracking-widest uppercase">
                <ScrambleText
                  text={`STAGE ${activeStage.step} OUTCOME — ${activeStage.title}`}
                  trigger="change"
                  durationMs={340}
                />
              </p>
              <p className="text-foreground text-sm font-medium">
                {activeMeta?.outcome ?? activeStage.description}
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-brand-gradient w-full shrink-0 text-white hover:opacity-95 sm:w-auto"
            >
              <Link href="/services" className="inline-flex items-center justify-center gap-1.5">
                <span>Explore Capabilities</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
