"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requirePermission, requireRole } from "@/lib/auth/guards";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createClient } from "@/lib/supabase/server";
import { fail, normalizeActionError, normalizeDatabaseError, ok } from "@/lib/utils/errors";
import {
  canActorManageRoleChange,
  platformSettingUpsertSchema,
  teamMemberUpsertSchema,
  userRoleChangeSchema,
  type PlatformSettingUpsertInput,
  type TeamMemberUpsertInput,
  type UserRoleChangeInput,
} from "@/lib/validations/admin";
import type { ActionResult } from "@/types";
import type { Json } from "@/types/database";

export async function upsertTeamMemberAction(
  rawInput: TeamMemberUpsertInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("team.manage");
    const parsed = teamMemberUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const socialLinks = {
      ...(parsed.data.linkedinUrl ? { linkedin: parsed.data.linkedinUrl } : {}),
      ...(parsed.data.githubUrl ? { github: parsed.data.githubUrl } : {}),
      ...(parsed.data.websiteUrl ? { website: parsed.data.websiteUrl } : {}),
    };

    const supabase = await createClient();
    const payload = {
      profile_id: parsed.data.profileId || null,
      full_name: parsed.data.fullName,
      role_title: parsed.data.roleTitle,
      is_founder: parsed.data.isFounder,
      bio: parsed.data.bio || null,
      avatar_media_id: parsed.data.avatarMediaId || null,
      social_links: socialLinks as unknown as Json,
      display_order: parsed.data.displayOrder,
      is_public: parsed.data.isPublic,
      is_active: parsed.data.isActive,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("team_members")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
      }

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "team_member.updated",
        entityType: "team_member",
        entityId: parsed.data.id,
      });

      revalidatePath("/admin/team");
      revalidatePath("/about");
      revalidatePath("/");
      return ok({ id: parsed.data.id });
    }

    const { data, error } = await supabase
      .from("team_members")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "team_member.created",
      entityType: "team_member",
      entityId: data.id,
    });

    revalidatePath("/admin/team");
    revalidatePath("/about");
    revalidatePath("/");
    return ok({ id: data.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function deleteTeamMemberAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("team.manage");
    const supabase = await createClient();
    const { error } = await supabase.from("team_members").delete().eq("id", id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "team_member.deleted",
      entityType: "team_member",
      entityId: id,
    });

    revalidatePath("/admin/team");
    revalidatePath("/about");
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function updateUserRoleAction(
  rawInput: UserRoleChangeInput
): Promise<ActionResult<{ userId: string }>> {
  try {
    await requirePermission("team.manage");
    const actor = await requireRole(["super_admin"]);

    const parsed = userRoleChangeSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const guard = canActorManageRoleChange({
      actorId: actor.id,
      actorRole: actor.role,
      targetUserId: parsed.data.targetUserId,
    });
    if (!guard.ok) {
      return fail("FORBIDDEN", guard.message);
    }

    const supabase = await createClient();
    const [{ data: target }, { data: nextRole }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, role_id, is_active")
        .eq("id", parsed.data.targetUserId)
        .maybeSingle(),
      supabase.from("roles").select("id, slug").eq("slug", parsed.data.roleSlug).maybeSingle(),
    ]);

    if (!target || !nextRole) {
      return fail("NOT_FOUND", "Target account or role does not exist.");
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        role_id: nextRole.id,
        is_active: parsed.data.isActive,
      })
      .eq("id", target.id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "profile.role_updated",
      entityType: "profile",
      entityId: target.id,
      oldValues: { role_id: target.role_id, is_active: target.is_active } as unknown as Json,
      newValues: { role_slug: nextRole.slug, is_active: parsed.data.isActive } as unknown as Json,
    });

    revalidatePath("/admin/team");
    revalidatePath("/admin/customers");
    revalidatePath("/admin");
    return ok({ userId: target.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function upsertPlatformSettingAction(
  rawInput: PlatformSettingUpsertInput
): Promise<ActionResult<{ key: string }>> {
  try {
    await requirePermission("settings.manage");
    const actor = await requireRole(["super_admin"]);

    const parsed = platformSettingUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    let decodedJson: Json;
    try {
      decodedJson = JSON.parse(parsed.data.valueJson) as Json;
    } catch {
      return fail("VALIDATION_ERROR", "Setting value must be valid JSON.");
    }

    const supabase = await createClient();
    const { error } = await supabase.from("platform_settings").upsert(
      {
        key: parsed.data.key,
        value: decodedJson,
        description: parsed.data.description || null,
        is_public: parsed.data.isPublic,
        updated_by: actor.id,
      },
      { onConflict: "key" }
    );

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "platform_setting.updated",
      entityType: "platform_setting",
      newValues: { key: parsed.data.key, is_public: parsed.data.isPublic } as unknown as Json,
    });

    updateTag("cms");
    revalidatePath("/admin/settings");
    return ok({ key: parsed.data.key });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

