import "server-only";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  companyName: string | null;
  jobTitle: string | null;
  avatarPath: string | null;
  isActive: boolean;
  role: UserRole;
  roleName: string;
  createdAt: string;
}

export async function getCurrentUser(): Promise<User | null> {
  await cookies();
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getCurrentAuthProfile(): Promise<AuthProfile | null> {
  await cookies();
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, role_id, full_name, email, phone, company_name, job_title, avatar_path, is_active, created_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("slug, name")
    .eq("id", profile.role_id)
    .maybeSingle();

  if (roleError || !roleRow) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    companyName: profile.company_name,
    jobTitle: profile.job_title,
    avatarPath: profile.avatar_path,
    isActive: profile.is_active,
    role: roleRow.slug,
    roleName: roleRow.name,
    createdAt: profile.created_at,
  };
}
