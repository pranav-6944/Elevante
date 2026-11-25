import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className
      )}
    >
      <p className="text-secondary text-xs font-semibold tracking-widest uppercase">{eyebrow}</p>
      <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description ? (
        <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
