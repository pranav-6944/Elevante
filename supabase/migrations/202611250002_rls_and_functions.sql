-- ELEVANTE Phase 3 Migration 0002: Row Level Security, RBAC Helpers & Rate Limiting

-- ---------------------------------------------------------------------------
-- 1. Security Helper Functions (Search-Path Hardened)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT r.slug
  FROM public.profiles p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = (SELECT auth.uid())
    AND p.is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(public.current_user_role() IN ('staff', 'admin', 'super_admin'), false);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(public.current_user_role() IN ('admin', 'super_admin'), false);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(public.current_user_role() = 'super_admin', false);
$$;

CREATE OR REPLACE FUNCTION public.user_has_permission(perm_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active = true
      AND (r.slug = 'super_admin' OR perm.code = perm_code)
  );
$$;

-- Prevent unauthorized role escalation or super_admin deactivation
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_privileged boolean := (
    current_user IN ('postgres', 'service_role', 'supabase_admin')
    OR COALESCE(auth.role(), '') = 'service_role'
    OR public.is_super_admin()
  );
  v_old_role text;
BEGIN
  IF NEW.role_id IS DISTINCT FROM OLD.role_id AND NOT v_is_privileged THEN
    RAISE EXCEPTION 'Forbidden: role_id can only be modified by super_admin';
  END IF;

  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    SELECT slug INTO v_old_role FROM public.roles WHERE id = OLD.role_id;
    IF (v_old_role = 'super_admin' OR NOT public.is_admin()) AND NOT v_is_privileged THEN
      RAISE EXCEPTION 'Forbidden: insufficient permission to alter account activation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

GRANT USAGE, SELECT ON SEQUENCE public.project_code_seq, public.quote_number_seq TO authenticated;

CREATE TRIGGER trg_profiles_guard_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- Atomic fixed-window rate limiter RPC (callable strictly via service_role)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_max_requests integer,
  p_window_seconds integer
)
RETURNS TABLE (allowed boolean, remaining integer, reset_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now timestamptz := now();
  v_window interval := make_interval(secs => p_window_seconds);
  v_row public.rate_limits%ROWTYPE;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, request_count)
  VALUES (p_key, v_now, 1)
  ON CONFLICT (key) DO UPDATE
    SET window_start = CASE
          WHEN public.rate_limits.window_start + v_window <= v_now THEN v_now
          ELSE public.rate_limits.window_start
        END,
        request_count = CASE
          WHEN public.rate_limits.window_start + v_window <= v_now THEN 1
          ELSE public.rate_limits.request_count + 1
        END
  RETURNING * INTO v_row;

  allowed := v_row.request_count <= p_max_requests;
  remaining := GREATEST(0, p_max_requests - v_row.request_count);
  reset_at := v_row.window_start + v_window;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

-- ---------------------------------------------------------------------------
-- 2. Enable RLS Across All Application Tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. RLS Policies
-- ---------------------------------------------------------------------------

-- Roles / Permissions (read-only for authenticated users; super_admin manages)
CREATE POLICY "Authenticated can view roles" ON public.roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manages roles" ON public.roles
  FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "Admin and staff can view permissions" ON public.permissions
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Super admin manages permissions" ON public.permissions
  FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "Admin and staff can view role_permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Super admin manages role_permissions" ON public.role_permissions
  FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "Admin views all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Staff views assigned customer profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    public.current_user_role() = 'staff' AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.customer_id = profiles.id AND pr.assigned_to = (SELECT auth.uid())
    )
  );
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "Admin updates profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Public Showcase & CMS Tables
CREATE POLICY "Public views published categories" ON public.service_categories
  FOR SELECT TO anon, authenticated USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "Admin and staff view all categories" ON public.service_categories
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admin manages categories" ON public.service_categories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public views published services" ON public.services
  FOR SELECT TO anon, authenticated USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "Admin and staff view all services" ON public.services
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admin manages services" ON public.services
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public views active fields of published services" ON public.service_form_fields
  FOR SELECT TO anon, authenticated USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_form_fields.service_id
        AND s.is_published = true
        AND s.deleted_at IS NULL
    )
  );
CREATE POLICY "Admin and staff view all form fields" ON public.service_form_fields
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admin manages form fields" ON public.service_form_fields
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public views media assets" ON public.media_assets
  FOR SELECT TO anon, authenticated USING (bucket = 'public-media');
CREATE POLICY "Admin manages media assets" ON public.media_assets
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public views active public team members" ON public.team_members
  FOR SELECT TO anon, authenticated USING (is_public = true AND is_active = true);
CREATE POLICY "Admin and staff view all team members" ON public.team_members
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admin manages team members" ON public.team_members
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public views published portfolio" ON public.portfolio_projects
  FOR SELECT TO anon, authenticated USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "Admin and staff view all portfolio" ON public.portfolio_projects
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admin manages portfolio" ON public.portfolio_projects
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public views published testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admin and staff view all testimonials" ON public.testimonials
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admin manages testimonials" ON public.testimonials
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public views published faqs" ON public.faqs
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admin and staff view all faqs" ON public.faqs
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admin manages faqs" ON public.faqs
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public views published site sections" ON public.site_sections
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admin and staff view all site sections" ON public.site_sections
  FOR SELECT TO authenticated USING (public.is_admin_or_staff());
CREATE POLICY "Admin manages site sections" ON public.site_sections
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public views public platform settings" ON public.platform_settings
  FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "Admin views all platform settings" ON public.platform_settings
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Super admin manages platform settings" ON public.platform_settings
  FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Project Requests & Brief Responses
CREATE POLICY "Customer views own projects" ON public.project_requests
  FOR SELECT TO authenticated USING (customer_id = (SELECT auth.uid()));
CREATE POLICY "Staff views assigned projects" ON public.project_requests
  FOR SELECT TO authenticated USING (
    public.current_user_role() = 'staff' AND assigned_to = (SELECT auth.uid())
  );
CREATE POLICY "Admin manages all projects" ON public.project_requests
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Customer inserts own project" ON public.project_requests
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = (SELECT auth.uid()));
CREATE POLICY "Staff updates assigned projects" ON public.project_requests
  FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'staff' AND assigned_to = (SELECT auth.uid()))
  WITH CHECK (public.current_user_role() = 'staff' AND assigned_to = (SELECT auth.uid()));

CREATE POLICY "Customer views own form responses" ON public.project_form_responses
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_form_responses.project_id
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Customer inserts own form responses" ON public.project_form_responses
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_form_responses.project_id
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Staff views assigned form responses" ON public.project_form_responses
  FOR SELECT TO authenticated USING (
    public.current_user_role() = 'staff' AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_form_responses.project_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  );
CREATE POLICY "Admin manages all form responses" ON public.project_form_responses
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Quotations & Line Items (never show 'draft' quotes to customers)
CREATE POLICY "Customer views non-draft own quotations" ON public.quotations
  FOR SELECT TO authenticated USING (
    status <> 'draft' AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = quotations.project_id
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Staff views assigned quotations" ON public.quotations
  FOR SELECT TO authenticated USING (
    public.current_user_role() = 'staff' AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = quotations.project_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  );
CREATE POLICY "Admin manages all quotations" ON public.quotations
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Customer views own non-draft quotation items" ON public.quotation_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.quotations q
      JOIN public.project_requests pr ON pr.id = q.project_id
      WHERE q.id = quotation_items.quotation_id
        AND q.status <> 'draft'
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Staff views assigned quotation items" ON public.quotation_items
  FOR SELECT TO authenticated USING (
    public.current_user_role() = 'staff' AND EXISTS (
      SELECT 1 FROM public.quotations q
      JOIN public.project_requests pr ON pr.id = q.project_id
      WHERE q.id = quotation_items.quotation_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  );
CREATE POLICY "Admin manages all quotation items" ON public.quotation_items
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Status History
CREATE POLICY "Customer views own status history" ON public.project_status_history
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_status_history.project_id
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Staff views assigned status history" ON public.project_status_history
  FOR SELECT TO authenticated USING (
    public.current_user_role() = 'staff' AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_status_history.project_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  );
CREATE POLICY "Admin manages status history" ON public.project_status_history
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Project Messages (strictly hides internal notes from customers)
CREATE POLICY "Customer views non-internal messages on own projects" ON public.project_messages
  FOR SELECT TO authenticated USING (
    is_internal_note = false AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_messages.project_id
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Customer inserts non-internal message on own projects" ON public.project_messages
  FOR INSERT TO authenticated WITH CHECK (
    is_internal_note = false
    AND sender_id = (SELECT auth.uid())
    AND message_type IN ('message', 'clarification_response')
    AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_messages.project_id
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Staff views and inserts assigned project messages" ON public.project_messages
  FOR ALL TO authenticated USING (
    public.current_user_role() = 'staff' AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_messages.project_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  ) WITH CHECK (
    public.current_user_role() = 'staff'
    AND sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_messages.project_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  );
CREATE POLICY "Admin manages all project messages" ON public.project_messages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Project Files (reference & message attachments)
CREATE POLICY "Customer views own project files" ON public.project_files
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_files.project_id
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Customer uploads own project files" ON public.project_files
  FOR INSERT TO authenticated WITH CHECK (
    uploaded_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_files.project_id
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Staff manages assigned project files" ON public.project_files
  FOR ALL TO authenticated USING (
    public.current_user_role() = 'staff' AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_files.project_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  ) WITH CHECK (
    public.current_user_role() = 'staff'
    AND uploaded_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_files.project_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  );
CREATE POLICY "Admin manages all project files" ON public.project_files
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Deliverables
CREATE POLICY "Customer views accessible deliverables for own projects" ON public.deliverables
  FOR SELECT TO authenticated USING (
    is_customer_accessible = true AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = deliverables.project_id
        AND pr.customer_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Staff manages assigned project deliverables" ON public.deliverables
  FOR ALL TO authenticated USING (
    public.current_user_role() = 'staff' AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = deliverables.project_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  ) WITH CHECK (
    public.current_user_role() = 'staff'
    AND uploaded_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = deliverables.project_id
        AND pr.assigned_to = (SELECT auth.uid())
    )
  );
CREATE POLICY "Admin manages all deliverables" ON public.deliverables
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Enquiries (server-side service_role handles public submission after rate-limit + Zod)
CREATE POLICY "Staff views assigned enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (
    public.current_user_role() = 'staff' AND assigned_to = (SELECT auth.uid())
  );
CREATE POLICY "Admin manages all enquiries" ON public.enquiries
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Notifications
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users mark own notifications read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Admin manages notifications" ON public.notifications
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Audit Logs (append via service_role; admin/super_admin read-only)
CREATE POLICY "Admin reads audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());

-- Future Payment Records (read-only scoping for now; mutations via service_role later)
CREATE POLICY "Customer reads own payment records" ON public.payment_records
  FOR SELECT TO authenticated USING (customer_id = (SELECT auth.uid()));
CREATE POLICY "Admin reads all payment records" ON public.payment_records
  FOR SELECT TO authenticated USING (public.is_admin());
