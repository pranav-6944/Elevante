import "server-only";
import { isSupabaseConfigured } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import {
  parseFieldOptions,
  parseValidationRules,
  type DynamicFieldSpec,
} from "@/lib/validations/dynamic-form";
import type { Database } from "@/types/database";

export type ProjectRequestRow = Database["public"]["Tables"]["project_requests"]["Row"];
export type ProjectFormResponseRow = Database["public"]["Tables"]["project_form_responses"]["Row"];
export type ProjectStatusHistoryRow = Database["public"]["Tables"]["project_status_history"]["Row"];
export type ProjectFileRow = Database["public"]["Tables"]["project_files"]["Row"];
export type DeliverableRow = Database["public"]["Tables"]["deliverables"]["Row"];
export type QuotationRow = Database["public"]["Tables"]["quotations"]["Row"];
export type QuotationItemRow = Database["public"]["Tables"]["quotation_items"]["Row"];
export type ProjectMessageRow = Database["public"]["Tables"]["project_messages"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export interface PortalServiceOption {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  categoryName: string;
  estimatedTimeline: string | null;
  pricingMode: Database["public"]["Tables"]["services"]["Row"]["pricing_mode"];
  startingPriceMinor: number | null;
  currency: string;
  fields: DynamicFieldSpec[];
}

export interface CustomerProjectSummary extends ProjectRequestRow {
  serviceTitle: string;
  serviceSlug: string | null;
}

export interface CustomerQuotationDetail extends QuotationRow {
  items: QuotationItemRow[];
}

export interface CustomerProjectDetailData {
  project: CustomerProjectSummary;
  responses: ProjectFormResponseRow[];
  statusHistory: ProjectStatusHistoryRow[];
  files: ProjectFileRow[];
  deliverables: DeliverableRow[];
  quotations: CustomerQuotationDetail[];
  messages: ProjectMessageRow[];
}

export interface CustomerFileItem {
  id: string;
  kind: "reference" | "deliverable";
  projectId: string;
  projectCode: string;
  projectTitle: string;
  title: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface CustomerDashboardOverview {
  totalProjects: number;
  activeProjects: number;
  quotedProjects: number;
  completedProjects: number;
  unreadNotifications: number;
  recentProjects: CustomerProjectSummary[];
  recentNotifications: NotificationRow[];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return count ?? 0;
}

export async function getCustomerProjects(userId: string): Promise<CustomerProjectSummary[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("project_requests")
    .select("*")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (!projects || projects.length === 0) return [];

  const serviceIds = Array.from(new Set(projects.map((p) => p.service_id)));
  const { data: services } = await supabase
    .from("services")
    .select("id, title, slug")
    .in("id", serviceIds);

  const svcMap = new Map((services ?? []).map((s) => [s.id, s]));

  return projects.map((project) => {
    const svc = svcMap.get(project.service_id);
    return {
      ...project,
      serviceTitle: svc?.title ?? "Custom Service",
      serviceSlug: svc?.slug ?? null,
    };
  });
}

export async function getCustomerNotifications(userId: string): Promise<NotificationRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function getCustomerDashboardData(userId: string): Promise<CustomerDashboardOverview> {
  if (!isSupabaseConfigured()) {
    return {
      totalProjects: 0,
      activeProjects: 0,
      quotedProjects: 0,
      completedProjects: 0,
      unreadNotifications: 0,
      recentProjects: [],
      recentNotifications: [],
    };
  }

  const [projects, notifications, unreadCount] = await Promise.all([
    getCustomerProjects(userId),
    getCustomerNotifications(userId),
    getUnreadNotificationCount(userId),
  ]);

  const activeProjects = projects.filter(
    (p) => !["completed", "cancelled"].includes(p.status)
  ).length;
  const quotedProjects = projects.filter((p) => p.status === "quoted").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;

  return {
    totalProjects: projects.length,
    activeProjects,
    quotedProjects,
    completedProjects,
    unreadNotifications: unreadCount,
    recentProjects: projects.slice(0, 5),
    recentNotifications: notifications.slice(0, 5),
  };
}

export async function getCustomerProjectDetail(
  userId: string,
  projectId: string
): Promise<CustomerProjectDetailData | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("project_requests")
    .select("*")
    .eq("id", projectId)
    .eq("customer_id", userId)
    .maybeSingle();

  if (!project) return null;

  const [
    { data: service },
    { data: responses },
    { data: statusHistory },
    { data: files },
    { data: deliverables },
    { data: quotations },
    { data: messages },
  ] = await Promise.all([
    supabase.from("services").select("id, title, slug").eq("id", project.service_id).maybeSingle(),
    supabase
      .from("project_form_responses")
      .select("*")
      .eq("project_id", project.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("project_status_history")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_files")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("deliverables")
      .select("*")
      .eq("project_id", project.id)
      .eq("is_customer_accessible", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("quotations")
      .select("*")
      .eq("project_id", project.id)
      .neq("status", "draft")
      .order("version", { ascending: false }),
    supabase
      .from("project_messages")
      .select("*")
      .eq("project_id", project.id)
      .eq("is_internal_note", false)
      .order("created_at", { ascending: true }),
  ]);

  const quotationList = quotations ?? [];
  let itemsByQuote = new Map<string, QuotationItemRow[]>();

  if (quotationList.length > 0) {
    const { data: items } = await supabase
      .from("quotation_items")
      .select("*")
      .in(
        "quotation_id",
        quotationList.map((q) => q.id)
      )
      .order("display_order", { ascending: true });

    itemsByQuote = (items ?? []).reduce((map, item) => {
      const existing = map.get(item.quotation_id) ?? [];
      existing.push(item);
      map.set(item.quotation_id, existing);
      return map;
    }, new Map<string, QuotationItemRow[]>());
  }

  return {
    project: {
      ...project,
      serviceTitle: service?.title ?? "Custom Service",
      serviceSlug: service?.slug ?? null,
    },
    responses: responses ?? [],
    statusHistory: statusHistory ?? [],
    files: files ?? [],
    deliverables: deliverables ?? [],
    quotations: quotationList.map((q) => ({
      ...q,
      items: itemsByQuote.get(q.id) ?? [],
    })),
    messages: messages ?? [],
  };
}

export async function getCustomerFilesData(userId: string): Promise<CustomerFileItem[]> {
  if (!isSupabaseConfigured()) return [];

  const projects = await getCustomerProjects(userId);
  if (projects.length === 0) return [];

  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const projectIds = projects.map((p) => p.id);

  const supabase = await createClient();
  const [{ data: refFiles }, { data: deliverables }] = await Promise.all([
    supabase
      .from("project_files")
      .select("*")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("deliverables")
      .select("*")
      .in("project_id", projectIds)
      .eq("is_customer_accessible", true)
      .order("created_at", { ascending: false }),
  ]);

  const items: CustomerFileItem[] = [];

  for (const file of refFiles ?? []) {
    const proj = projectMap.get(file.project_id);
    if (!proj) continue;
    items.push({
      id: file.id,
      kind: "reference",
      projectId: file.project_id,
      projectCode: proj.project_code,
      projectTitle: proj.title,
      title: file.original_filename,
      originalFilename: file.original_filename,
      mimeType: file.mime_type,
      fileSize: file.file_size,
      createdAt: file.created_at,
    });
  }

  for (const del of deliverables ?? []) {
    const proj = projectMap.get(del.project_id);
    if (!proj) continue;
    items.push({
      id: del.id,
      kind: "deliverable",
      projectId: del.project_id,
      projectCode: proj.project_code,
      projectTitle: proj.title,
      title: `${del.title} (${del.version_label})`,
      originalFilename: del.original_filename,
      mimeType: del.mime_type,
      fileSize: del.file_size,
      createdAt: del.created_at,
    });
  }

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPortalServicesForPicker(): Promise<PortalServiceOption[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const [{ data: categories }, { data: services }, { data: fields }] = await Promise.all([
    supabase
      .from("service_categories")
      .select("id, name")
      .eq("is_published", true)
      .is("deleted_at", null),
    supabase
      .from("services")
      .select("*")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("service_form_fields")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
  ]);

  if (!services || !categories) return [];

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const fieldsByService = new Map<string, DynamicFieldSpec[]>();

  for (const field of fields ?? []) {
    const list = fieldsByService.get(field.service_id) ?? [];
    list.push({
      id: field.id,
      fieldKey: field.field_key,
      label: field.label,
      fieldType: field.field_type,
      placeholder: field.placeholder,
      helpText: field.help_text,
      options: parseFieldOptions(field.options),
      validationRules: parseValidationRules(field.validation_rules),
      isRequired: field.is_required,
      displayOrder: field.display_order,
      isActive: field.is_active,
    });
    fieldsByService.set(field.service_id, list);
  }

  return services
    .filter((svc) => catMap.has(svc.category_id))
    .map((svc) => ({
      id: svc.id,
      title: svc.title,
      slug: svc.slug,
      shortDescription: svc.short_description,
      categoryName: catMap.get(svc.category_id)!.name,
      estimatedTimeline: svc.estimated_timeline,
      pricingMode: svc.pricing_mode,
      startingPriceMinor: svc.starting_price_minor,
      currency: svc.currency,
      fields: fieldsByService.get(svc.id) ?? [],
    }));
}
