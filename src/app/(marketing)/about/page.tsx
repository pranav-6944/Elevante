import Link from "next/link";
import { ArrowRight, Target, Shield, Cpu } from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { FoundersSection } from "@/components/marketing/FoundersSection";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn about ELEVANTE, our engineering-first agency culture, and founders Pranav Lamkhade and Omkar Sable.",
  path: "/about",
});

const PRINCIPLES = [
  {
    icon: Target,
    title: "Outcome-Driven Scope",
    description:
      "Every engagement starts with clear requirements, realistic timelines, and an itemized quotation aligned to your business goals.",
  },
  {
    icon: Shield,
    title: "Security & Reliability",
    description:
      "Server-side validation, role-based access control, and private client storage are engineered into our platforms from day one.",
  },
  {
    icon: Cpu,
    title: "Modern Full-Stack Craft",
    description:
      "We pair maintainable TypeScript web engineering with data automation, applied AI, and polished visual design systems.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 py-14 sm:py-20">
      <section className="space-y-6">
        <SectionHeader
          eyebrow="About ELEVANTE"
          title="Built to turn complex digital ideas into reliable business platforms."
          description="Founded by Pranav Lamkhade and co-founded by Omkar Sable, ELEVANTE bridges full-stack software engineering, data automation, AI integration, and strategic brand design."
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-brand-gradient text-white hover:opacity-95">
            <Link href="/contact" className="inline-flex items-center gap-2">
              <span>Work With Us</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/services">Explore Services</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {PRINCIPLES.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="bg-card">
              <CardHeader className="space-y-2">
                <div className="bg-accent text-primary flex size-10 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-8">
        <SectionHeader
          eyebrow="Founders"
          title="Leadership Behind Every Delivery"
          description="Direct accountability from initial scoping through final deliverable sign-off."
        />
        <FoundersSection />
      </section>
    </div>
  );
}
