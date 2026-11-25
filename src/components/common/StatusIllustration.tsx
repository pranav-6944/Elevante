import { cn } from "@/lib/utils";

export type IllustrationKind = "not-found" | "server-error" | "empty";

interface StatusIllustrationProps {
  kind: IllustrationKind;
  className?: string;
}

export function StatusIllustration({ kind, className }: StatusIllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-36 w-54", className)}
    >
      <defs>
        <linearGradient
          id={`elevante-grad-${kind}`}
          x1="20"
          y1="20"
          x2="220"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#17264F" />
          <stop offset="52%" stopColor="#245B70" />
          <stop offset="100%" stopColor="#319C78" />
        </linearGradient>
      </defs>
      <rect
        x="24"
        y="20"
        width="192"
        height="120"
        rx="18"
        fill="#FFFFFF"
        stroke="#D8DDD6"
        strokeWidth="2"
      />
      <rect
        x="24"
        y="20"
        width="192"
        height="24"
        rx="18"
        fill={`url(#elevante-grad-${kind})`}
        opacity="0.14"
      />
      <circle cx="44" cy="32" r="4" fill="#17264F" />
      <circle cx="58" cy="32" r="4" fill="#245B70" />
      <circle cx="72" cy="32" r="4" fill="#319C78" />

      {kind === "not-found" && (
        <g>
          <circle cx="112" cy="86" r="24" stroke={`url(#elevante-grad-${kind})`} strokeWidth="5" />
          <path d="M130 104L148 122" stroke="#319C78" strokeWidth="6" strokeLinecap="round" />
          <path d="M104 86H120" stroke="#17264F" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {kind === "server-error" && (
        <g>
          <path
            d="M120 58L150 112H90L120 58Z"
            stroke={`url(#elevante-grad-${kind})`}
            strokeWidth="4.5"
            strokeLinejoin="round"
            fill="#F5F6F2"
          />
          <path d="M120 77V93" stroke="#17264F" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="120" cy="103" r="3" fill="#319C78" />
        </g>
      )}

      {kind === "empty" && (
        <g>
          <rect
            x="76"
            y="64"
            width="88"
            height="54"
            rx="10"
            fill="#F5F6F2"
            stroke="#245B70"
            strokeWidth="2.5"
          />
          <path
            d="M92 84H148"
            stroke="#17264F"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path d="M92 98H130" stroke="#319C78" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
