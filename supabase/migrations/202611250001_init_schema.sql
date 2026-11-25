-- ELEVANTE Phase 3 Migration 0001: Core Relational Schema, Enums, Sequences & Triggers
-- Reference: DATABASE_DESIGN.md

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Enum Types
-- ---------------------------------------------------------------------------
CREATE TYPE public.project_status AS ENUM (
  'submitted',
  'under_review',
  'clarification_needed',
  'quoted',
  'quote_accepted',
  'in_progress',
  'review_ready',
  'revision_requested',
  'completed',
  'cancelled'
);

CREATE TYPE public.project_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TYPE public.quotation_status AS ENUM (
  'draft',
  'sent',
  'viewed',
  'accepted',
  'revision_requested',
  'declined',
  'expired'
);

CREATE TYPE public.pricing_mode AS ENUM (
  'quote_only',
  'starting_from',
  'fixed_estimate'
);

CREATE TYPE public.form_field_type AS ENUM (
  'text',
  'textarea',
  'number',
  'email',
  'url',
  'date',
  'select',
  'multiselect',
  'radio',
  'checkbox',
  'file'
);

CREATE TYPE public.message_type AS ENUM (
  'message',
  'clarification_request',
  'clarification_response',
  'system'
);

CREATE TYPE public.enquiry_status AS ENUM (
  'new',
  'contacted',
  'converted',
  'archived'
);

CREATE TYPE public.media_type AS ENUM (
  'image',
  'video',
  'document'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'authorized',
  'paid',
  'failed',
  'refunded'
);

-- ---------------------------------------------------------------------------
-- 2. Common Utility Trigger Functions & Code Generators
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS public.project_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.quote_number_seq START 1;

CREATE OR REPLACE FUNCTION public.next_project_code()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'ELV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.project_code_seq')::text, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.next_quote_number()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'QT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.quote_number_seq')::text, 4, '0');
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Identity, RBAC & Team Tables
-- ---------------------------------------------------------------------------
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug IN ('customer', 'staff', 'admin', 'super_admin')),
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure baseline system roles always exist for auth signup triggers
INSERT INTO public.roles (slug, name, description, is_system)
VALUES
  ('customer', 'Customer', 'Client portal user with access strictly scoped to own projects and files.', true),
  ('staff', 'Agency Staff', 'Internal specialist with access to assigned projects and deliverables.', true),
  ('admin', 'Administrator', 'Agency operations, CRM, quotations, services, and CMS management.', true),
  ('super_admin', 'Super Administrator', 'Full platform governance including roles, settings, and audit logs.', true)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  module text NOT NULL,
  description text
);

CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  company_name text,
  job_title text,
  avatar_path text,
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL DEFAULT 'public-media',
  storage_path text NOT NULL UNIQUE,
  public_url text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  media_type public.media_type NOT NULL,
  alt_text text,
  caption text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  role_title text NOT NULL,
  is_founder boolean NOT NULL DEFAULT false,
  bio text,
  avatar_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Dynamic Services & Form Builder Tables
-- ---------------------------------------------------------------------------
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon_name text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text NOT NULL,
  full_description text NOT NULL,
  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  tech_stack text[] NOT NULL DEFAULT '{}'::text[],
  estimated_timeline text,
  pricing_mode public.pricing_mode NOT NULL DEFAULT 'quote_only',
  starting_price_minor bigint CHECK (starting_price_minor IS NULL OR starting_price_minor >= 0),
  currency text NOT NULL DEFAULT 'INR',
  thumbnail_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.service_form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  label text NOT NULL,
  field_type public.form_field_type NOT NULL,
  placeholder text,
  help_text text,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_required boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, field_key)
);

CREATE TRIGGER trg_service_form_fields_updated_at
  BEFORE UPDATE ON public.service_form_fields
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Project Workflow, Quotations, Messaging, Files & Deliverables
-- ---------------------------------------------------------------------------
CREATE TABLE public.project_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code text NOT NULL UNIQUE DEFAULT public.next_project_code(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text NOT NULL,
  status public.project_status NOT NULL DEFAULT 'submitted',
  priority public.project_priority NOT NULL DEFAULT 'normal',
  desired_deadline date,
  budget_range text,
  form_schema_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_project_requests_updated_at
  BEFORE UPDATE ON public.project_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.project_form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  field_id uuid REFERENCES public.service_form_fields(id) ON DELETE SET NULL,
  field_key text NOT NULL,
  field_label text NOT NULL,
  field_type public.form_field_type NOT NULL,
  response_value jsonb NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  quote_number text NOT NULL UNIQUE DEFAULT public.next_quote_number(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  title text NOT NULL,
  scope_summary text NOT NULL,
  subtotal_minor bigint NOT NULL CHECK (subtotal_minor >= 0),
  discount_minor bigint NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_minor bigint NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  total_minor bigint NOT NULL CHECK (total_minor >= 0),
  currency text NOT NULL DEFAULT 'INR',
  estimated_duration text,
  terms text,
  status public.quotation_status NOT NULL DEFAULT 'draft',
  valid_until date,
  customer_response_note text,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, version)
);

CREATE TRIGGER trg_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_minor bigint NOT NULL CHECK (unit_price_minor >= 0),
  line_total_minor bigint NOT NULL CHECK (line_total_minor >= 0),
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.project_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  from_status public.project_status,
  to_status public.project_status NOT NULL,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.project_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  message_type public.message_type NOT NULL DEFAULT 'message',
  body text NOT NULL,
  is_internal_note boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.project_messages(id) ON DELETE SET NULL,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  bucket text NOT NULL DEFAULT 'project-attachments',
  storage_path text NOT NULL UNIQUE,
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  purpose text NOT NULL CHECK (purpose IN ('reference', 'message_attachment')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  version_label text NOT NULL DEFAULT 'v1.0',
  bucket text NOT NULL DEFAULT 'project-deliverables',
  storage_path text NOT NULL UNIQUE,
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  is_customer_accessible boolean NOT NULL DEFAULT true,
  download_count integer NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6. Public Showcase, CMS, Enquiries, Audit, Notifications & Future Payments
-- ---------------------------------------------------------------------------
CREATE TABLE public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  client_name text,
  industry text,
  summary text NOT NULL,
  challenge text,
  solution text,
  outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  tech_stack text[] NOT NULL DEFAULT '{}'::text[],
  live_url text,
  cover_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  gallery_media_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_project_id uuid REFERENCES public.portfolio_projects(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  author_role text,
  company text,
  quote text NOT NULL,
  rating smallint CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  avatar_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  section_key text NOT NULL,
  title text,
  subtitle text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_key, section_key)
);

CREATE TRIGGER trg_site_sections_updated_at
  BEFORE UPDATE ON public.site_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  service_interest text,
  subject text NOT NULL,
  message text NOT NULL,
  status public.enquiry_status NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  converted_project_id uuid REFERENCES public.project_requests(id) ON DELETE SET NULL,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  link_url text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.project_requests(id) ON DELETE RESTRICT,
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_payment_id text,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency text NOT NULL DEFAULT 'INR',
  status public.payment_status NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_payment_records_updated_at
  BEFORE UPDATE ON public.payment_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1 CHECK (request_count >= 0)
);

-- ---------------------------------------------------------------------------
-- 7. Performance Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_service_form_fields_service_order ON public.service_form_fields(service_id, display_order);
CREATE INDEX idx_project_requests_customer_created ON public.project_requests(customer_id, created_at DESC);
CREATE INDEX idx_project_requests_assigned_status ON public.project_requests(assigned_to, status);
CREATE INDEX idx_project_requests_status_created ON public.project_requests(status, created_at DESC);
CREATE INDEX idx_project_form_responses_project ON public.project_form_responses(project_id, display_order);
CREATE INDEX idx_quotations_project_version ON public.quotations(project_id, version DESC);
CREATE INDEX idx_quotation_items_quotation ON public.quotation_items(quotation_id, display_order);
CREATE INDEX idx_project_status_history_project ON public.project_status_history(project_id, created_at DESC);
CREATE INDEX idx_project_messages_project_created ON public.project_messages(project_id, created_at ASC);
CREATE INDEX idx_project_files_project ON public.project_files(project_id);
CREATE INDEX idx_deliverables_project ON public.deliverables(project_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_enquiries_status_created ON public.enquiries(status, created_at DESC);

CREATE INDEX idx_service_categories_published ON public.service_categories(display_order)
  WHERE is_published = true AND deleted_at IS NULL;
CREATE INDEX idx_services_published ON public.services(category_id, display_order)
  WHERE is_published = true AND deleted_at IS NULL;
CREATE INDEX idx_portfolio_published ON public.portfolio_projects(display_order)
  WHERE is_published = true AND deleted_at IS NULL;
CREATE INDEX idx_testimonials_published ON public.testimonials(display_order)
  WHERE is_published = true;
CREATE INDEX idx_faqs_published ON public.faqs(category, display_order)
  WHERE is_published = true;

-- ---------------------------------------------------------------------------
-- 8. Auth User Signup Sync Trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  default_role_id uuid;
  display_name text;
BEGIN
  SELECT id INTO default_role_id
  FROM public.roles
  WHERE slug = 'customer'
  LIMIT 1;

  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'System role "customer" is missing from public.roles';
  END IF;

  display_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
    split_part(COALESCE(NEW.email, 'User'), '@', 1)
  );

  INSERT INTO public.profiles (id, role_id, full_name, email)
  VALUES (NEW.id, default_role_id, display_name, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

