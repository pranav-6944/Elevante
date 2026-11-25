import { BrandLogo } from "@/components/common/BrandLogo";

export function HeroFallbackGraphic() {
  return (
    <div className="border-border/80 bg-card/85 relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border p-8 shadow-sm">
      <div
        aria-hidden="true"
        className="bg-brand-green/15 pointer-events-none absolute -top-24 -right-24 size-64 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="bg-brand-navy/15 pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full blur-3xl"
      />

      <svg
        viewBox="0 0 360 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-55"
      >
        <defs>
          <linearGradient
            id="hero-orb-ring"
            x1="40"
            y1="40"
            x2="320"
            y2="320"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#17264F" />
            <stop offset="52%" stopColor="#245B70" />
            <stop offset="100%" stopColor="#319C78" />
          </linearGradient>
        </defs>
        <circle
          cx="180"
          cy="180"
          r="132"
          stroke="url(#hero-orb-ring)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
        />
        <circle cx="180" cy="180" r="96" stroke="#245B70" strokeWidth="1.2" opacity="0.45" />
        <polygon
          points="180,58 286,120 286,240 180,302 74,240 74,120"
          stroke="url(#hero-orb-ring)"
          strokeWidth="1.5"
          opacity="0.7"
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="flex size-24 items-center justify-center rounded-2xl border bg-white p-4 shadow-sm">
          <BrandLogo variant="mark" className="h-14 w-auto" priority />
        </div>
        <div className="space-y-1">
          <p className="font-heading text-foreground text-sm font-semibold tracking-wide">
            Engineering &amp; Design Studio
          </p>
          <p className="text-muted-foreground text-xs">
            Web Platforms • 3D Web • AI &amp; Analytics • Branding
          </p>
        </div>
      </div>
    </div>
  );
}
