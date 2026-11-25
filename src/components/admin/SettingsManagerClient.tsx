"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Save } from "lucide-react";
import { upsertPlatformSettingAction } from "@/actions/admin-gov.actions";
import type { PlatformSettingRow } from "@/lib/services/admin.service";
import type { UserRole } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function SettingsManagerClient({
  actorRole,
  settings,
}: {
  actorRole: UserRole;
  settings: PlatformSettingRow[];
}) {
  const router = useRouter();
  const isSuperAdmin = actorRole === "super_admin";

  const [key, setKey] = useState(settings[0]?.key ?? "agency_profile");
  const [valueJson, setValueJson] = useState(
    JSON.stringify(settings[0]?.value ?? { name: "ELEVANTE" }, null, 2)
  );
  const [description, setDescription] = useState(settings[0]?.description ?? "");
  const [isPublic, setIsPublic] = useState(settings[0]?.is_public ?? true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  function loadSetting(item: PlatformSettingRow) {
    setKey(item.key);
    setValueJson(JSON.stringify(item.value, null, 2));
    setDescription(item.description ?? "");
    setIsPublic(item.is_public);
    setFeedback(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const res = await upsertPlatformSettingAction({
      key,
      valueJson,
      description,
      isPublic,
    });

    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setFeedback({ type: "success", message: `Saved setting "${key}" and updated cache.` });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
          System Configuration
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Platform Settings</h1>
      </div>

      {!isSuperAdmin ? (
        <Alert>
          <Lock className="size-4" aria-hidden="true" />
          <AlertDescription>
            Platform settings are read-only for Admins; only Super Administrators can write
            settings.
          </AlertDescription>
        </Alert>
      ) : null}

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2.5">
          {settings.length === 0 ? (
            <Card className="bg-card text-muted-foreground border-dashed p-8 text-center text-sm">
              No database settings rows yet.
            </Card>
          ) : (
            settings.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => loadSetting(item)}
                className="bg-card hover:border-secondary w-full rounded-2xl border p-4 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold">{item.key}</span>
                  <Badge variant={item.is_public ? "default" : "outline"}>
                    {item.is_public ? "Public" : "Private"}
                  </Badge>
                </div>
                {item.description ? (
                  <p className="text-muted-foreground mt-1 text-xs">{item.description}</p>
                ) : null}
              </button>
            ))
          )}
        </div>

        <Card className="bg-card h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Edit Setting JSON</CardTitle>
            <CardDescription>
              Updates apply immediately to server configuration reads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="set-key">Setting Key</Label>
                <Input
                  id="set-key"
                  required
                  disabled={!isSuperAdmin}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-desc">Description</Label>
                <Input
                  id="set-desc"
                  disabled={!isSuperAdmin}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-json">JSON Value</Label>
                <Textarea
                  id="set-json"
                  rows={6}
                  className="font-mono text-xs"
                  disabled={!isSuperAdmin}
                  value={valueJson}
                  onChange={(e) => setValueJson(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <Label htmlFor="set-pub">Publicly Readable</Label>
                <Switch
                  id="set-pub"
                  disabled={!isSuperAdmin}
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              <Button
                type="submit"
                disabled={!isSuperAdmin || busy}
                className="bg-brand-gradient text-white"
              >
                <Save className="size-4" aria-hidden="true" />
                <span>{busy ? "Saving..." : "Save Setting"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
