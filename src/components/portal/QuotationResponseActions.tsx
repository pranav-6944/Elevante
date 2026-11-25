"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { respondToQuotationAction } from "@/actions/workflow.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QuotationStatus } from "@/types/database";

export function QuotationResponseActions({
  quotationId,
  status,
  existingNote,
}: {
  quotationId: string;
  status: QuotationStatus;
  existingNote: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (status !== "sent" && status !== "viewed") {
    return existingNote ? (
      <div className="bg-background rounded-xl border p-3 text-xs">
        <span className="text-muted-foreground font-medium">Your response note: </span>
        <span className="text-foreground">{existingNote}</span>
      </div>
    ) : null;
  }

  function submitDecision(decision: "accepted" | "revision_requested" | "declined") {
    setError(null);
    startTransition(async () => {
      const res = await respondToQuotationAction({ quotationId, decision, note });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setNote("");
      router.refresh();
    });
  }

  return (
    <div className="bg-background space-y-3 rounded-xl border p-4">
      <div className="space-y-1.5">
        <Label htmlFor={`quote-note-${quotationId}`} className="text-xs font-medium">
          Response Note (required if requesting revisions)
        </Label>
        <Textarea
          id={`quote-note-${quotationId}`}
          rows={2}
          value={note}
          disabled={isPending}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add acceptance comments, milestone questions, or requested adjustments..."
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          className="bg-brand-gradient text-white"
          onClick={() => submitDecision("accepted")}
        >
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          <span>Accept Quotation</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => submitDecision("revision_requested")}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          <span>Request Revision</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          className="text-destructive hover:text-destructive"
          onClick={() => submitDecision("declined")}
        >
          <XCircle className="size-3.5" aria-hidden="true" />
          <span>Decline</span>
        </Button>
      </div>
    </div>
  );
}
