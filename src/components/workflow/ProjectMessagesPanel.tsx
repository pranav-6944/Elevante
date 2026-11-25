"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, Send } from "lucide-react";
import { postProjectMessageAction } from "@/actions/workflow.actions";
import { formatShortDate } from "@/lib/utils/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { MessageType, ProjectStatus } from "@/types/database";

interface MessageItem {
  id: string;
  sender_id: string;
  message_type: MessageType;
  body: string;
  is_internal_note: boolean;
  created_at: string;
}

export function ProjectMessagesPanel({
  projectId,
  customerId,
  projectStatus,
  mode,
  messages,
}: {
  projectId: string;
  customerId: string;
  projectStatus: ProjectStatus;
  mode: "customer" | "admin";
  messages: MessageItem[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [messageType, setMessageType] = useState<
    "message" | "clarification_request" | "clarification_response"
  >(
    mode === "customer" && projectStatus === "clarification_needed"
      ? "clarification_response"
      : "message"
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isClosed = projectStatus === "cancelled";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const effectiveType = mode === "admin" && isInternalNote ? "message" : messageType;

      const res = await postProjectMessageAction({
        projectId,
        messageType: effectiveType,
        body,
        isInternalNote: mode === "admin" ? isInternalNote : false,
      });

      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      setBody("");
      if (mode === "customer" && messageType === "clarification_response") {
        setMessageType("message");
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="bg-background text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
          No messages yet. Start a conversation or post a project update below.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isFromCustomer = msg.sender_id === customerId;
            return (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 text-sm ${
                  msg.is_internal_note ? "border-amber-500/40 bg-amber-500/5" : "bg-background"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground font-semibold">
                      {mode === "customer"
                        ? isFromCustomer
                          ? "You"
                          : "ELEVANTE Team"
                        : isFromCustomer
                          ? "Customer"
                          : "Agency Team"}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {msg.message_type.replaceAll("_", " ")}
                    </Badge>
                    {msg.is_internal_note ? (
                      <Badge variant="secondary" className="gap-1 bg-amber-500/15 text-amber-800">
                        <Lock className="size-3" aria-hidden="true" />
                        Internal Note
                      </Badge>
                    ) : null}
                  </div>
                  <span className="text-muted-foreground">{formatShortDate(msg.created_at)}</span>
                </div>
                <p className="text-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                  {msg.body}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {isClosed ? (
        <p className="text-muted-foreground text-xs">
          Messaging is disabled because this project is marked Cancelled.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card space-y-3 rounded-xl border p-4">
          {mode === "admin" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="msg-type" className="text-xs">
                  Message Type
                </Label>
                <Select
                  value={isInternalNote ? "message" : messageType}
                  disabled={isInternalNote || isPending}
                  onValueChange={(v) => setMessageType(v as "message" | "clarification_request")}
                >
                  <SelectTrigger id="msg-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Standard Project Update</SelectItem>
                    <SelectItem value="clarification_request">
                      Clarification Request (Sets Status)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between self-end rounded-lg border px-3 py-2">
                <Label htmlFor="msg-internal" className="text-xs font-medium">
                  Internal Note (Hidden from Client)
                </Label>
                <Switch
                  id="msg-internal"
                  checked={isInternalNote}
                  disabled={isPending}
                  onCheckedChange={setIsInternalNote}
                />
              </div>
            </div>
          ) : projectStatus === "clarification_needed" ? (
            <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs">
              <span>Clarification requested by our team — send your reply below.</span>
              <Select
                value={messageType}
                disabled={isPending}
                onValueChange={(v) => setMessageType(v as "message" | "clarification_response")}
              >
                <SelectTrigger className="h-7 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clarification_response">Clarification Response</SelectItem>
                  <SelectItem value="message">General Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor={`msg-body-${mode}`} className="text-xs font-medium">
              {mode === "admin" && isInternalNote ? "Internal Team Note" : "Message"}
            </Label>
            <Textarea
              id={`msg-body-${mode}`}
              rows={3}
              required
              disabled={isPending}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                mode === "admin" && isInternalNote
                  ? "Write private internal engineering/delivery notes..."
                  : "Write a clear message..."
              }
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="bg-brand-gradient text-white"
          >
            <Send className="size-3.5" aria-hidden="true" />
            <span>{isPending ? "Sending..." : "Post Message"}</span>
          </Button>
        </form>
      )}
    </div>
  );
}
