export interface HeroSlide {
  id: string;
  src: string;
  alt: string;
  label: string;
}

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "hero-3",
    src: "/images/hero-studio-3.webp",
    alt: "ELEVANTE 3D WebGL showcase featuring interactive AI workflows, analytics graphs, and brand typography boards",
    label: "3D Web & AI Workflows",
  },
  {
    id: "hero-2",
    src: "/images/hero-studio-2.webp",
    alt: "ELEVANTE Product Studio showcase featuring multi-stack dashboards, workflow orchestration, and brand design",
    label: "Multi-Stack Dashboards",
  },
  {
    id: "hero-1",
    src: "/images/hero-studio-1.webp",
    alt: "Engineering and design team collaborating around the ELEVANTE digital solutions workspace",
    label: "Studio Collaboration",
  },
];

export const HERO_SLIDE_INTERVAL_MS = 4200;

export function getNextHeroSlideIndex(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return (currentIndex + 1) % total;
}

