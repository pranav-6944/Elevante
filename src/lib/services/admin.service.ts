import "server-only";
import { isSupabaseConfigured } from "@/config/env";
import type { AuthProfile } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";
import type { Database } from "@/types/database";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type RoleRow = Database["public"]["Tables"]["roles"]["Row"];
export type PermissionRow = Database["public"]["Tables"]["permissions"]["Row"];
export type EnquiryRow = Database["public"]["Tables"]["enquiries"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["project_requests"]["Row"];
export type QuotationRow = Database["public"]["Tables"]["quotations"]["Row"];
export type QuotationItemRow = Database["public"]["Tables"]["quotation_items"]["Row"];
export type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
export type PlatformSettingRow = Database["public"]["Tables"]["platform_settings"]["Row"];

export interface AdminUserWithRole extends ProfileRow {
  roleSlug: UserRole;
  roleName: string;
}

export interface AdminCustomerRecord extends ProfileRow {
  projectCount: number;
}

export interface AdminProjectListItem extends ProjectRow {
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  assigneeName: string | null;
}

export interface AdminQuotationItemRecord extends QuotationRow {
  projectCode: string;
  projectTitle: string;
  customerName: string;
  items: QuotationItemRow[];
}

export interface AdminOverviewData {
  openEnquiriesCount: number;
  activeProjectsCount: number;
  pendingQuotesCount: number;
  totalCustomersCount: number;
  pipelineByCurrency: Array<{ currency: string; totalMinor: number }>;
  recentProjects: AdminProjectListItem[];
  recentEnquiries: EnquiryRow[];
  recentAuditLogs: AuditLogRow[];
}

export async function getStaffAssigneeOptions(): Promise<
  Array<{ id: string; fullName: string; roleSlug: UserRole }>
> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role_id, is_active").eq("is_active", true),
    supabase.from("roles").select("id, slug"),
  ]);

  const roleMap = new Map((roles ?? []).map((r) => [r.id, r.slug as UserRole]));
  return (profiles ?? [])
    .map((p) => ({
      id: p.id,
      fullName: p.full_name,
      roleSlug: roleMap.get(p.role_id) ?? ("customer" as UserRole),
    }))
    .filter((u) => u.roleSlug !== "customer")
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getAdminProjects(actor: AuthProfile): Promise<AdminProjectListItem[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  let projectQuery = supabase
    .from("project_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (!isAdminRole(actor.role)) {
    projectQuery = projectQuery.eq("assigned_to", actor.id);
  }

  const { data: projects } = await projectQuery;
  if (!projects || projects.length === 0) return [];

  const [{ data: services }, { data: profiles }] = await Promise.all([
    supabase.from("services").select("id, title"),
    supabase.from("profiles").select("id, full_name, email"),
  ]);

  const svcMap = new Map((services ?? []).map((s) => [s.id, s.title]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return projects.map((project) => {
    const cust = profileMap.get(project.customer_id);
    const assignee = project.assigned_to ? profileMap.get(project.assigned_to) : undefined;
    return {
      ...project,
      serviceTitle: svcMap.get(project.service_id) ?? "Custom Service",
      customerName: cust?.full_name ?? "Customer",
      customerEmail: cust?.email ?? "",
      assigneeName: assignee?.full_name ?? null,
    };
  });
}

export async function getAdminProjectDetail(actor: AuthProfile, projectId: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("project_requests")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return null;
  if (!isAdminRole(actor.role) && project.assigned_to !== actor.id) {
    return null;
  }

  const [
    { data: service },
    { data: customer },
    { data: responses },
    { data: files },
    { data: deliverables },
    { data: quotations },
    { data: messages },
    { data: statusHistory },
    staffOptions,
  ] = await Promise.all([
    supabase.from("services").select("id, title, slug").eq("id", project.service_id).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, company_name")
      .eq("id", project.customer_id)
      .maybeSingle(),
    supabase
      .from("project_form_responses")
      .select("*")
      .eq("project_id", project.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("project_files")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("deliverables")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("quotations")
      .select("*")
      .eq("project_id", project.id)
      .order("version", { ascending: false }),
    supabase
      .from("project_messages")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("project_status_history")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false }),
    getStaffAssigneeOptions(),
  ]);

  return {
    project,
    serviceTitle: service?.title ?? "Custom Service",
    customer,
    responses: responses ?? [],
    files: files ?? [],
    deliverables: deliverables ?? [],
    quotations: quotations ?? [],
    messages: messages ?? [],
    statusHistory: statusHistory ?? [],
    staffOptions,
  };
}

export async function getAdminOverviewMetrics(actor: AuthProfile): Promise<AdminOverviewData> {
  if (!isSupabaseConfigured()) {
    return {
      openEnquiriesCount: 0,
      activeProjectsCount: 0,
      pendingQuotesCount: 0,
      totalCustomersCount: 0,
      pipelineByCurrency: [],
      recentProjects: [],
      recentEnquiries: [],
      recentAuditLogs: [],
    };
  }

  const supabase = await createClient();
  const isFullAdmin = isAdminRole(actor.role);

  const [
    projects,
    { data: enquiries },
    { data: quotes },
    { data: roles },
    { data: profiles },
    { data: audits },
  ] = await Promise.all([
    getAdminProjects(actor),
    isFullAdmin
      ? supabase.from("enquiries").select("*").order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as EnquiryRow[] }),
    supabase.from("quotations").select("id, status, total_minor, currency"),
    supabase.from("roles").select("id, slug"),
    isFullAdmin ? supabase.from("profiles").select("id, role_id") : Promise.resolve({ data: [] }),
    isFullAdmin
      ? supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(8)
      : Promise.resolve({ data: [] as AuditLogRow[] }),
  ]);

  const customerRoleId = (roles ?? []).find((r) => r.slug === "customer")?.id;
  const totalCustomersCount = customerRoleId
    ? (profiles ?? []).filter((p) => p.role_id === customerRoleId).length
    : 0;

  const enquiryList = enquiries ?? [];
  const openEnquiriesCount = enquiryList.filter(
    (e) => e.status === "new" || e.status === "contacted"
  ).length;

  const activeProjectsCount = projects.filter(
    (p) => !["completed", "cancelled"].includes(p.status)
  ).length;

  const quoteList = quotes ?? [];
  const pendingQuotesCount = quoteList.filter(
    (q) => q.status === "sent" || q.status === "viewed"
  ).length;

  const pipelineMap = new Map<string, number>();
  for (const q of quoteList) {
    if (["sent", "viewed", "accepted"].includes(q.status)) {
      pipelineMap.set(q.currency, (pipelineMap.get(q.currency) ?? 0) + q.total_minor);
    }
  }

  return {
    openEnquiriesCount,
    activeProjectsCount,
    pendingQuotesCount,
    totalCustomersCount,
    pipelineByCurrency: Array.from(pipelineMap.entries()).map(([currency, totalMinor]) => ({
      currency,
      totalMinor,
    })),
    recentProjects: projects.slice(0, 5),
    recentEnquiries: enquiryList.slice(0, 5),
    recentAuditLogs: audits ?? [],
  };
}

export async function getAdminCustomers(): Promise<AdminCustomerRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const [{ data: roles }, { data: profiles }, { data: projects }] = await Promise.all([
    supabase.from("roles").select("id, slug"),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("project_requests").select("customer_id"),
  ]);

  const customerRoleId = (roles ?? []).find((r) => r.slug === "customer")?.id;
  if (!customerRoleId) return [];

  const countMap = new Map<string, number>();
  for (const p of projects ?? []) {
    countMap.set(p.customer_id, (countMap.get(p.customer_id) ?? 0) + 1);
  }

  return (profiles ?? [])
    .filter((p) => p.role_id === customerRoleId)
    .map((p) => ({
      ...p,
      projectCount: countMap.get(p.id) ?? 0,
    }));
}

export async function getAdminEnquiriesData(): Promise<{
  enquiries: EnquiryRow[];
  staffOptions: Array<{ id: string; fullName: string; roleSlug: UserRole }>;
}> {
  if (!isSupabaseConfigured()) return { enquiries: [], staffOptions: [] };
  const supabase = await createClient();

  const [{ data: enquiries }, staffOptions] = await Promise.all([
    supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
    getStaffAssigneeOptions(),
  ]);

  return {
    enquiries: enquiries ?? [],
    staffOptions,
  };
}

export async function getAdminQuotationsData(): Promise<{
  quotations: AdminQuotationItemRecord[];
  projects: AdminProjectListItem[];
}> {
  if (!isSupabaseConfigured()) return { quotations: [], projects: [] };
  const supabase = await createClient();

  const [{ data: quotes }, { data: items }, { data: rawProjects }, { data: profiles }] =
    await Promise.all([
      supabase.from("quotations").select("*").order("created_at", { ascending: false }),
      supabase.from("quotation_items").select("*").order("display_order", { ascending: true }),
      supabase.from("project_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email"),
    ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const projectMap = new Map((rawProjects ?? []).map((p) => [p.id, p]));
  const itemsByQuote = new Map<string, QuotationItemRow[]>();

  for (const item of items ?? []) {
    const arr = itemsByQuote.get(item.quotation_id) ?? [];
    arr.push(item);
    itemsByQuote.set(item.quotation_id, arr);
  }

  const quotations: AdminQuotationItemRecord[] = (quotes ?? []).map((q) => {
    const proj = projectMap.get(q.project_id);
    const cust = proj ? profileMap.get(proj.customer_id) : undefined;
    return {
      ...q,
      projectCode: proj?.project_code ?? "N/A",
      projectTitle: proj?.title ?? "Project",
      customerName: cust?.full_name ?? "Customer",
      items: itemsByQuote.get(q.id) ?? [],
    };
  });

  const projects: AdminProjectListItem[] = (rawProjects ?? []).map((p) => {
    const cust = profileMap.get(p.customer_id);
    return {
      ...p,
      serviceTitle: "",
      customerName: cust?.full_name ?? "Customer",
      customerEmail: cust?.email ?? "",
      assigneeName: null,
    };
  });

  return { quotations, projects };
}

export async function getAdminTeamAndRolesData() {
  if (!isSupabaseConfigured()) {
    return {
      teamMembers: [] as TeamMemberRow[],
      users: [] as AdminUserWithRole[],
      roles: [] as RoleRow[],
      permissions: [] as PermissionRow[],
      rolePermissions: [] as Array<{ role_id: string; permission_id: string }>,
    };
  }

  const supabase = await createClient();
  const [
    { data: teamMembers },
    { data: profiles },
    { data: roles },
    { data: permissions },
    { data: rolePermissions },
  ] = await Promise.all([
    supabase.from("team_members").select("*").order("display_order", { ascending: true }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("roles").select("*").order("name", { ascending: true }),
    supabase.from("permissions").select("*").order("module", { ascending: true }),
    supabase.from("role_permissions").select("*"),
  ]);

  const roleMap = new Map((roles ?? []).map((r) => [r.id, r]));
  const users: AdminUserWithRole[] = (profiles ?? []).map((p) => {
    const role = roleMap.get(p.role_id);
    return {
      ...p,
      roleSlug: (role?.slug ?? "customer") as UserRole,
      roleName: role?.name ?? "Customer",
    };
  });

  return {
    teamMembers: teamMembers ?? [],
    users,
    roles: roles ?? [],
    permissions: permissions ?? [],
    rolePermissions: rolePermissions ?? [],
  };
}

export async function getAdminAnalyticsData() {
  if (!isSupabaseConfigured()) {
    return {
      projectsByStatus: [] as Array<{ status: string; count: number }>,
      enquiriesByStatus: [] as Array<{ status: string; count: number }>,
      quotationsByStatus: [] as Array<{ status: string; count: number }>,
      totalsByCurrency: [] as Array<{
        currency: string;
        quotedMinor: number;
        acceptedMinor: number;
      }>,
      topServices: [] as Array<{ title: string; count: number }>,
    };
  }

  const supabase = await createClient();
  const [{ data: projects }, { data: enquiries }, { data: quotes }, { data: services }] =
    await Promise.all([
      supabase.from("project_requests").select("status, service_id"),
      supabase.from("enquiries").select("status"),
      supabase.from("quotations").select("status, total_minor, currency"),
      supabase.from("services").select("id, title"),
    ]);

  const countBy = <T extends string>(items: T[]) => {
    const map = new Map<string, number>();
    for (const k of items) map.set(k, (map.get(k) ?? 0) + 1);
    return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
  };

  const svcMap = new Map((services ?? []).map((s) => [s.id, s.title]));
  const svcCounts = new Map<string, number>();
  for (const p of projects ?? []) {
    const title = svcMap.get(p.service_id) ?? "Other";
    svcCounts.set(title, (svcCounts.get(title) ?? 0) + 1);
  }

  const currencyMap = new Map<string, { quotedMinor: number; acceptedMinor: number }>();
  for (const q of quotes ?? []) {
    if (q.status === "draft") continue;
    const entry = currencyMap.get(q.currency) ?? { quotedMinor: 0, acceptedMinor: 0 };
    entry.quotedMinor += q.total_minor;
    if (q.status === "accepted") entry.acceptedMinor += q.total_minor;
    currencyMap.set(q.currency, entry);
  }

  return {
    projectsByStatus: countBy((projects ?? []).map((p) => p.status)),
    enquiriesByStatus: countBy((enquiries ?? []).map((e) => e.status)),
    quotationsByStatus: countBy((quotes ?? []).map((q) => q.status)),
    totalsByCurrency: Array.from(currencyMap.entries()).map(([currency, v]) => ({
      currency,
      ...v,
    })),
    topServices: Array.from(svcCounts.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getAdminAuditLogs(limit = 100): Promise<AuditLogRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAdminPlatformSettings(): Promise<PlatformSettingRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("*")
    .order("key", { ascending: true });
  return data ?? [];
}
