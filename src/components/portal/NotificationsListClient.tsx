"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CheckCheck } from "lucide-react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/portal.actions";
import { sanitizeRedirectPath } from "@/lib/auth/redirects";
import type { NotificationRow } from "@/lib/services/portal.service";
import { formatShortDate } from "@/lib/utils/format";
import { EmptyState } from "@/components/common/EmptyState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NotificationsListClient({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const visible = unreadOnly ? notifications.filter((n) => !n.is_read) : notifications;

  function handleMarkOne(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await markNotificationReadAction(id);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      router.refresh();
    });
  }

  function handleMarkAll() {
    setError(null);
    startTransition(async () => {
      const res = await markAllNotificationsReadAction();
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="You're All Caught Up"
        description="Project submission confirmations, quotation notices, and deliverable alerts will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={!unreadOnly ? "default" : "outline"}
            onClick={() => setUnreadOnly(false)}
          >
            All ({notifications.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={unreadOnly ? "default" : "outline"}
            onClick={() => setUnreadOnly(true)}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {unreadCount > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleMarkAll}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            <span>Mark All Read</span>
          </Button>
        ) : null}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {visible.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
          No unread notifications remaining.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => {
            const safeLink = item.link_url
              ? sanitizeRedirectPath(item.link_url, "/dashboard")
              : null;

            return (
              <Card
                key={item.id}
                className={item.is_read ? "bg-card/70" : "bg-card border-secondary/40"}
              >
                <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground font-semibold">{item.title}</p>
                      {!item.is_read ? (
                        <Badge className="bg-brand-green text-white">Unread</Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground text-sm">{item.body}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatShortDate(item.created_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {safeLink ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={safeLink}>View</Link>
                      </Button>
                    ) : null}
                    {!item.is_read ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => handleMarkOne(item.id)}
                      >
                        <Check className="size-4" aria-hidden="true" />
                        <span>Mark Read</span>
                      </Button>
                    ) : null}
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
