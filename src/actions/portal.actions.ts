"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isSupabaseConfigured } from "@/config/env";
import { requireAuth } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { fail, normalizeActionError, normalizeDatabaseError, ok } from "@/lib/utils/errors";
import type { ActionResult } from "@/types";

const uuidSchema = z.string().uuid("Invalid notification identifier.");

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireAuth();
    if (!isSupabaseConfigured()) {
      return fail("CONFIGURATION_ERROR", "Supabase environment is not configured.");
    }

    const parsed = uuidSchema.safeParse(notificationId);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", parsed.data)
      .eq("user_id", actor.id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notifications");
    return ok({ id: parsed.data });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<{ count: number }>> {
  try {
    const actor = await requireAuth();
    if (!isSupabaseConfigured()) {
      return fail("CONFIGURATION_ERROR", "Supabase environment is not configured.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", actor.id)
      .eq("is_read", false)
      .select("id");

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notifications");
    return ok({ count: data?.length ?? 0 });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}
