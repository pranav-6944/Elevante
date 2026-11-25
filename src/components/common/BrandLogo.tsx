import Image from "next/image";
import { BRAND } from "@/config/site";
import { cn } from "@/lib/utils";

type LogoVariant = "horizontal" | "vertical" | "mark";

interface BrandLogoProps {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ variant = "horizontal", className, priority = false }: BrandLogoProps) {
  const asset = BRAND.logos[variant];

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      className={cn("h-auto w-auto object-contain select-none", className)}
    />
  );
}
