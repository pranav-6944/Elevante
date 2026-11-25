"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormInput, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteServiceAction, toggleServicePublishAction } from "@/actions/catalog.actions";
import type { CategoryRow, ServiceRow } from "@/lib/services/catalog.service";
import { formatMoneyMinor } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ServicesManager({
  services,
  categories,
}: {
  services: ServiceRow[];
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  async function handleToggle(svc: ServiceRow) {
    setBusyId(svc.id);
    setError(null);
    const res = await toggleServicePublishAction(svc.id, !svc.is_published);
    setBusyId(null);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    router.refresh();
  }

  async function handleArchive(id: string) {
    setBusyId(id);
    setError(null);
    const res = await deleteServiceAction(id);
    setBusyId(null);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Services Catalog</h1>
          <p className="text-muted-foreground text-sm">
            Manage services, deliverables, pricing display, and custom intake brief forms.
          </p>
        </div>
        <Button asChild className="bg-brand-gradient text-white">
          <Link href="/admin/services/new" className="inline-flex items-center gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            <span>New Service</span>
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {services.length === 0 ? (
        <Card className="bg-card border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            No services created yet. Ensure at least one category exists, then add your first
            service.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => {
            const priceLabel = formatMoneyMinor(svc.starting_price_minor, svc.currency);
            return (
              <Card key={svc.id} className="bg-card">
                <CardContent className="flex flex-col justify-between gap-4 py-5 lg:flex-row lg:items-center">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-foreground text-lg font-semibold">{svc.title}</h2>
                      <Badge variant={svc.is_published ? "default" : "outline"}>
                        {svc.is_published ? "Published" : "Draft"}
                      </Badge>
                      {svc.is_featured ? <Badge variant="secondary">Featured</Badge> : null}
                      <Badge variant="outline">{catMap.get(svc.category_id) ?? "Category"}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{svc.short_description}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      /services/{svc.slug}
                      {priceLabel ? ` • From ${priceLabel}` : " • Custom Quote"}
                      {svc.estimated_timeline ? ` • ${svc.estimated_timeline}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/admin/services/${svc.id}/form`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <FormInput className="size-3.5" aria-hidden="true" />
                        <span>Form Builder</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/admin/services/${svc.id}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === svc.id}
                      onClick={() => handleToggle(svc)}
                    >
                      {svc.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      disabled={busyId === svc.id}
                      aria-label={`Archive ${svc.title}`}
                      onClick={() => handleArchive(svc.id)}
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
