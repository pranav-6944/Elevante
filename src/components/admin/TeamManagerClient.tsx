"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
import {
  deleteTeamMemberAction,
  updateUserRoleAction,
  upsertTeamMemberAction,
} from "@/actions/admin-gov.actions";
import type {
  AdminUserWithRole,
  PermissionRow,
  RoleRow,
  TeamMemberRow,
} from "@/lib/services/admin.service";
import type { UserRole } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function TeamManagerClient({
  actorId,
  actorRole,
  teamMembers,
  users,
  roles,
  permissions,
  rolePermissions,
}: {
  actorId: string;
  actorRole: UserRole;
  teamMembers: TeamMemberRow[];
  users: AdminUserWithRole[];
  roles: RoleRow[];
  permissions: PermissionRow[];
  rolePermissions: Array<{ role_id: string; permission_id: string }>;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [isFounder, setIsFounder] = useState(false);
  const [bio, setBio] = useState("");
  const [displayOrder, setDisplayOrder] = useState(teamMembers.length);
  const [isPublic, setIsPublic] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const isSuperAdmin = actorRole === "super_admin";

  function startEditMember(member: TeamMemberRow) {
    setEditingId(member.id);
    setFullName(member.full_name);
    setRoleTitle(member.role_title);
    setIsFounder(member.is_founder);
    setBio(member.bio ?? "");
    setDisplayOrder(member.display_order);
    setIsPublic(member.is_public);
    setIsActive(member.is_active);
    setFeedback(null);
  }

  async function handleSaveMember(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const res = await upsertTeamMemberAction({
      ...(editingId ? { id: editingId } : {}),
      fullName,
      roleTitle,
      isFounder,
      bio,
      displayOrder,
      isPublic,
      isActive,
    });

    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setEditingId(null);
    setFullName("");
    setRoleTitle("");
    setIsFounder(false);
    setBio("");
    setFeedback({ type: "success", message: "Team roster updated." });
    router.refresh();
  }

  async function handleRoleChange(
    user: AdminUserWithRole,
    nextRoleSlug: UserRole,
    nextActive: boolean
  ) {
    setBusy(true);
    setFeedback(null);
    const res = await updateUserRoleAction({
      targetUserId: user.id,
      roleSlug: nextRoleSlug,
      isActive: nextActive,
    });
    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }
    setFeedback({ type: "success", message: `Updated role for ${user.email}.` });
    router.refresh();
  }

  const permSet = new Set(rolePermissions.map((rp) => `${rp.role_id}:${rp.permission_id}`));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
          Organization & Access Control
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Team & Role Permissions
        </h1>
      </div>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="roster" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roster">Agency Showcase ({teamMembers.length})</TabsTrigger>
          <TabsTrigger value="rbac">RBAC Users ({users.length})</TabsTrigger>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-card h-fit">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? "Edit Team Member" : "Add Team Member"}
              </CardTitle>
              <CardDescription>Displayed on public agency leadership profiles.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveMember} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tm-fullname">Full Name</Label>
                  <Input
                    id="tm-fullname"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tm-roletitle">Role Title</Label>
                  <Input
                    id="tm-roletitle"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tm-bio">Bio</Label>
                  <Textarea
                    id="tm-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <Label htmlFor="tm-fnd">Founder</Label>
                    <Switch id="tm-fnd" checked={isFounder} onCheckedChange={setIsFounder} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <Label htmlFor="tm-pub">Public</Label>
                    <Switch id="tm-pub" checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <Label htmlFor="tm-act">Active</Label>
                    <Switch id="tm-act" checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>
                <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
                  <Plus className="size-4" aria-hidden="true" />
                  <span>{editingId ? "Update Member" : "Add Member"}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <Card key={member.id} className="bg-card">
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground font-semibold">{member.full_name}</p>
                      <Badge variant="outline">{member.role_title}</Badge>
                      {member.is_founder ? <Badge variant="secondary">Founder</Badge> : null}
                    </div>
                    {member.bio ? (
                      <p className="text-muted-foreground text-xs">{member.bio}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => startEditMember(member)}
                      aria-label="Edit member"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        await deleteTeamMemberAction(member.id);
                        router.refresh();
                      }}
                      aria-label="Delete member"
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rbac" className="space-y-4">
          {!isSuperAdmin ? (
            <Alert>
              <Shield className="size-4" aria-hidden="true" />
              <AlertDescription>
                Only a Super Administrator can promote or change user RBAC roles (enforced by server
                guards and Postgres triggers).
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-3">
            {users.map((u) => {
              const isSelf = u.id === actorId;
              return (
                <Card key={u.id} className="bg-card">
                  <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-foreground font-semibold">{u.full_name}</p>
                        <Badge variant="outline" className="capitalize">
                          {u.roleSlug.replace("_", " ")}
                        </Badge>
                        {isSelf ? <Badge variant="secondary">You</Badge> : null}
                      </div>
                      <p className="text-muted-foreground text-xs">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        value={u.roleSlug}
                        disabled={!isSuperAdmin || isSelf || busy}
                        onValueChange={(nextRole) =>
                          handleRoleChange(u, nextRole as UserRole, u.is_active)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.slug} className="capitalize">
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Switch
                        aria-label={`Active status for ${u.email}`}
                        checked={u.is_active}
                        disabled={!isSuperAdmin || isSelf || busy}
                        onCheckedChange={(checked) => handleRoleChange(u, u.roleSlug, checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="matrix">
          <Card className="bg-card overflow-x-auto">
            <CardContent className="p-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-semibold">Permission</th>
                    {roles.map((r) => (
                      <th key={r.id} className="px-3 py-2 font-semibold capitalize">
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {permissions.map((perm) => (
                    <tr key={perm.id}>
                      <td className="py-2 pr-4">
                        <span className="font-mono font-medium">{perm.code}</span>
                      </td>
                      {roles.map((r) => (
                        <td key={r.id} className="px-3 py-2">
                          {r.slug === "super_admin" || permSet.has(`${r.id}:${perm.id}`)
                            ? "Allowed"
                            : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
