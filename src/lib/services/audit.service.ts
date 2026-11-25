import "server-only";
import { isAdminSupabaseConfigured } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export async function recordAuditLog(params: {
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: Json | null;
  newValues?: Json | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  if (!isAdminSupabaseConfigured()) {
    return;
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("audit_logs").insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      old_values: params.oldValues ?? null,
      new_values: params.newValues ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ? params.userAgent.slice(0, 300) : null,
    });
    if (error) {
      console.error("Failed to persist audit log:", error.message);
    }
  } catch (err) {
    console.error("Audit logging exception:", err);
  }
}
