import { cacheLife, cacheTag } from "next/cache";
import { isSupabaseConfigured } from "@/config/env";
import { createPublicDataClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { formatMoneyMinor } from "@/lib/utils/format";
import {
  parseFieldOptions,
  parseValidationRules,
  type DynamicFieldSpec,
} from "@/lib/validations/dynamic-form";
import type { Database, Json } from "@/types/database";

export { formatMoneyMinor };

export type CategoryRow = Database["public"]["Tables"]["service_categories"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
export type SiteSectionRow = Database["public"]["Tables"]["site_sections"]["Row"];
export type MediaAssetRow = Database["public"]["Tables"]["media_assets"]["Row"];
export type PortfolioProjectRow = Database["public"]["Tables"]["portfolio_projects"]["Row"];
export type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];

export interface PublicPortfolioCard {
  id: string;
  title: string;
  slug: string;
  clientName: string | null;
  industry: string | null;
  summary: string;
  outcomes: string[];
  techStack: string[];
  liveUrl: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  isFeatured: boolean;
}

export interface PublicPortfolioDetail extends PublicPortfolioCard {
  challenge: string | null;
  solution: string | null;
  serviceId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PublicServiceCard {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  title: string;
  slug: string;
  shortDescription: string;
  estimatedTimeline: string | null;
  pricingMode: ServiceRow["pricing_mode"];
  startingPriceMinor: number | null;
  currency: string;
  techStack: string[];
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  isFeatured: boolean;
}

export interface PublicServiceDetail extends PublicServiceCard {
  fullDescription: string;
  deliverables: string[];
  features: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  fields: DynamicFieldSpec[];
  faqs: FaqRow[];
}

function toStringArray(raw: Json): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

export async function getPublishedCategories(): Promise<CategoryRow[]> {
  "use cache";
  cacheTag("categories");
  cacheLife("minutes");

  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicDataClient();
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getPublishedServices(): Promise<PublicServiceCard[]> {
  "use cache";
  cacheTag("services", "categories", "cms");
  cacheLife("minutes");

  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicDataClient();
  const [{ data: services }, { data: categories }, { data: media }] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("service_categories")
      .select("id, name, slug")
      .eq("is_published", true)
      .is("deleted_at", null),
    supabase.from("media_assets").select("id, public_url, alt_text"),
  ]);

  if (!services || !categories) return [];

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const mediaMap = new Map((media ?? []).map((m) => [m.id, m]));

  return services
    .filter((svc) => catMap.has(svc.category_id))
    .map((svc) => {
      const cat = catMap.get(svc.category_id)!;
      const thumb = svc.thumbnail_media_id ? mediaMap.get(svc.thumbnail_media_id) : undefined;
      return {
        id: svc.id,
        categoryId: svc.category_id,
        categoryName: cat.name,
        categorySlug: cat.slug,
        title: svc.title,
        slug: svc.slug,
        shortDescription: svc.short_description,
        estimatedTimeline: svc.estimated_timeline,
        pricingMode: svc.pricing_mode,
        startingPriceMinor: svc.starting_price_minor,
        currency: svc.currency,
        techStack: svc.tech_stack,
        thumbnailUrl: thumb?.public_url ?? null,
        thumbnailAlt: thumb?.alt_text ?? svc.title,
        isFeatured: svc.is_featured,
      };
    });
}

export async function getPublishedServiceBySlug(slug: string): Promise<PublicServiceDetail | null> {
  "use cache";
  cacheTag("services", "categories", "forms", "faqs", "cms");
  cacheLife("minutes");

  if (!isSupabaseConfigured()) return null;

  const supabase = createPublicDataClient();
  const { data: svc } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!svc) return null;

  const [{ data: category }, { data: fields }, { data: faqs }, { data: thumb }] = await Promise.all(
    [
      supabase
        .from("service_categories")
        .select("id, name, slug")
        .eq("id", svc.category_id)
        .eq("is_published", true)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("service_form_fields")
        .select("*")
        .eq("service_id", svc.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("faqs")
        .select("*")
        .eq("service_id", svc.id)
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
      svc.thumbnail_media_id
        ? supabase
            .from("media_assets")
            .select("public_url, alt_text")
            .eq("id", svc.thumbnail_media_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]
  );

  if (!category) return null;

  return {
    id: svc.id,
    categoryId: svc.category_id,
    categoryName: category.name,
    categorySlug: category.slug,
    title: svc.title,
    slug: svc.slug,
    shortDescription: svc.short_description,
    fullDescription: svc.full_description,
    deliverables: toStringArray(svc.deliverables),
    features: toStringArray(svc.features),
    techStack: svc.tech_stack,
    estimatedTimeline: svc.estimated_timeline,
    pricingMode: svc.pricing_mode,
    startingPriceMinor: svc.starting_price_minor,
    currency: svc.currency,
    thumbnailUrl: thumb?.public_url ?? null,
    thumbnailAlt: thumb?.alt_text ?? svc.title,
    isFeatured: svc.is_featured,
    seoTitle: svc.seo_title,
    seoDescription: svc.seo_description,
    fields: (fields ?? []).map((f) => ({
      id: f.id,
      fieldKey: f.field_key,
      label: f.label,
      fieldType: f.field_type,
      placeholder: f.placeholder,
      helpText: f.help_text,
      options: parseFieldOptions(f.options),
      validationRules: parseValidationRules(f.validation_rules),
      isRequired: f.is_required,
      displayOrder: f.display_order,
      isActive: f.is_active,
    })),
    faqs: faqs ?? [],
  };
}

export async function getPublishedFaqs(): Promise<FaqRow[]> {
  "use cache";
  cacheTag("faqs");
  cacheLife("minutes");

  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicDataClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  return data ?? [];
}

export async function getPublishedSiteSection(
  pageKey: string,
  sectionKey: string
): Promise<SiteSectionRow | null> {
  "use cache";
  cacheTag("cms");
  cacheLife("minutes");

  if (!isSupabaseConfigured()) return null;

  const supabase = createPublicDataClient();
  const { data } = await supabase
    .from("site_sections")
    .select("*")
    .eq("page_key", pageKey)
    .eq("section_key", sectionKey)
    .eq("is_published", true)
    .maybeSingle();

  return data ?? null;
}

// ---------------------------------------------------------------------------
// Admin Readers (must be called after RBAC verification in Server Components)
// ---------------------------------------------------------------------------
export async function getAdminCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_categories")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getAdminServices(): Promise<ServiceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getAdminServiceById(serviceId: string): Promise<{
  service: ServiceRow;
  fields: DynamicFieldSpec[];
} | null> {
  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!service) return null;

  const { data: fields } = await supabase
    .from("service_form_fields")
    .select("*")
    .eq("service_id", serviceId)
    .order("display_order", { ascending: true });

  return {
    service,
    fields: (fields ?? []).map((f) => ({
      id: f.id,
      fieldKey: f.field_key,
      label: f.label,
      fieldType: f.field_type,
      placeholder: f.placeholder,
      helpText: f.help_text,
      options: parseFieldOptions(f.options),
      validationRules: parseValidationRules(f.validation_rules),
      isRequired: f.is_required,
      displayOrder: f.display_order,
      isActive: f.is_active,
    })),
  };
}

export async function getAdminFaqs(): Promise<FaqRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getAdminSiteSections(): Promise<SiteSectionRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_sections")
    .select("*")
    .order("page_key", { ascending: true });
  return data ?? [];
}

export async function getAdminMediaAssets(): Promise<MediaAssetRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getPublishedPortfolioProjects(): Promise<PublicPortfolioCard[]> {
  "use cache";
  cacheTag("portfolio", "cms");
  cacheLife("minutes");

  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicDataClient();
  const [{ data: rows }, { data: media }] = await Promise.all([
    supabase
      .from("portfolio_projects")
      .select("*")
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("display_order", { ascending: true }),
    supabase.from("media_assets").select("id, public_url, alt_text"),
  ]);

  if (!rows) return [];
  const mediaMap = new Map((media ?? []).map((m) => [m.id, m]));

  return rows.map((row) => {
    const cover = row.cover_media_id ? mediaMap.get(row.cover_media_id) : undefined;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      clientName: row.client_name,
      industry: row.industry,
      summary: row.summary,
      outcomes: toStringArray(row.outcomes),
      techStack: row.tech_stack,
      liveUrl: row.live_url,
      coverImageUrl: cover?.public_url ?? null,
      coverImageAlt: cover?.alt_text ?? row.title,
      isFeatured: row.is_featured,
    };
  });
}

export async function getPublishedPortfolioBySlug(
  slug: string
): Promise<PublicPortfolioDetail | null> {
  "use cache";
  cacheTag("portfolio", "cms");
  cacheLife("minutes");

  if (!isSupabaseConfigured()) return null;

  const supabase = createPublicDataClient();
  const { data: row } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!row) return null;

  const { data: cover } = row.cover_media_id
    ? await supabase
        .from("media_assets")
        .select("public_url, alt_text")
        .eq("id", row.cover_media_id)
        .maybeSingle()
    : { data: null };

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    clientName: row.client_name,
    industry: row.industry,
    summary: row.summary,
    challenge: row.challenge,
    solution: row.solution,
    serviceId: row.service_id,
    outcomes: toStringArray(row.outcomes),
    techStack: row.tech_stack,
    liveUrl: row.live_url,
    coverImageUrl: cover?.public_url ?? null,
    coverImageAlt: cover?.alt_text ?? row.title,
    isFeatured: row.is_featured,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

export async function getPublishedTestimonials(): Promise<TestimonialRow[]> {
  "use cache";
  cacheTag("testimonials");
  cacheLife("minutes");

  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicDataClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  return data ?? [];
}

export async function getAdminPortfolioProjects(): Promise<PortfolioProjectRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("portfolio_projects")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getAdminTestimonials(): Promise<TestimonialRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true });
  return data ?? [];
}
