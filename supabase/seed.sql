-- ELEVANTE Initial Operational Seed (No fabricated reviews or demo portfolio records)

-- 1. Granular Permissions
INSERT INTO public.permissions (code, module, description)
VALUES
  ('services.manage', 'services', 'Create, edit, publish, and archive service categories and services'),
  ('forms.manage', 'services', 'Configure dynamic service brief fields'),
  ('projects.read_all', 'projects', 'View all customer project requests'),
  ('projects.manage', 'projects', 'Update project status, assign staff, and manage workflows'),
  ('quotations.manage', 'quotations', 'Create, edit, and dispatch customer quotations'),
  ('enquiries.manage', 'enquiries', 'Review, update, and convert public contact enquiries'),
  ('portfolio.manage', 'cms', 'Publish and manage portfolio case studies'),
  ('cms.manage', 'cms', 'Edit website sections, testimonials, FAQs, and SEO metadata'),
  ('media.manage', 'media', 'Upload and organize public media library assets'),
  ('team.manage', 'team', 'Manage team roster and RBAC roles'),
  ('analytics.read', 'analytics', 'View agency KPIs and operational reports'),
  ('audit.read', 'audit', 'Inspect immutable administrative audit logs'),
  ('settings.manage', 'settings', 'Modify platform-wide settings')
ON CONFLICT (code) DO NOTHING;

-- Assign full operational permissions to admin and super_admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug IN ('admin', 'super_admin')
ON CONFLICT DO NOTHING;

-- Assign scoped permissions to staff
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN ('analytics.read')
WHERE r.slug = 'staff'
ON CONFLICT DO NOTHING;

-- 2. Agency Founders (`team_members`)
INSERT INTO public.team_members (id, full_name, role_title, is_founder, bio, display_order, is_public, is_active)
VALUES
  (
    '11111111-1111-4111-8111-111111111101',
    'Pranav Lamkhade',
    'Founder',
    true,
    'Leads technical architecture, full-stack web platforms, database engineering, and AI/analytics solutions at ELEVANTE.',
    1,
    true,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'Omkar Sable',
    'Co-Founder',
    true,
    'Co-leads agency operations, client discovery, visual presentation, and cross-disciplinary execution at ELEVANTE.',
    2,
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Service Categories (Baseline published taxonomy ready for Phase 5 services)
INSERT INTO public.service_categories (name, slug, description, icon_name, display_order, is_published)
VALUES
  ('Web & 3D Experiences', 'web-3d-experiences', 'Production websites, marketing platforms, and interactive Three.js web experiences.', 'globe', 1, true),
  ('Application Engineering', 'application-engineering', 'Full-stack web applications, client portals, and internal operational systems.', 'smartphone', 2, true),
  ('Data Analytics & Automation', 'data-analytics-automation', 'Operational analytics dashboards and repeatable Excel/CSV automation pipelines.', 'bar-chart', 3, true),
  ('AI Solutions', 'ai-solutions', 'Practical LLM integrations, RAG workflows, and intelligent business automation.', 'sparkles', 4, true),
  ('Brand & Executive Design', 'brand-executive-design', 'Logo systems, brand guidelines, pitch decks, and professional document design.', 'pen-tool', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- 4. Platform Settings Defaults
INSERT INTO public.platform_settings (key, value, description, is_public)
VALUES
  (
    'agency_profile',
    '{"name":"ELEVANTE","email":"pranavlamkhade21@gmail.com","location":"Pune, Maharashtra, India","responseSla":"Within 1–2 business days"}'::jsonb,
    'Public agency contact and identity details',
    true
  ),
  (
    'default_currency',
    '{"code":"INR","symbol":"₹"}'::jsonb,
    'Default quotation currency',
    true
  ),
  (
    'upload_limits',
    '{"referenceMaxBytes":26214400,"deliverableMaxBytes":104857600,"publicMediaMaxBytes":52428800}'::jsonb,
    'File upload size caps in bytes',
    false
  )
ON CONFLICT (key) DO NOTHING;

-- 5. Initial Website Content Sections
INSERT INTO public.site_sections (page_key, section_key, title, subtitle, content, is_published)
VALUES
  (
    'home',
    'hero',
    'Digital solutions built for measurable business elevation.',
    'ELEVANTE partners with founders and growing organizations to ship production websites, 3D web experiences, full-stack applications, data automation, AI workflows, and strategic brand design.',
    '{"primaryCtaLabel":"Start a Project","primaryCtaHref":"/contact","secondaryCtaLabel":"Explore Capabilities","secondaryCtaHref":"/services"}'::jsonb,
    true
  ),
  (
    'home',
    'intro',
    'One integrated agency for product engineering, data intelligence, and brand clarity.',
    'Full-stack software engineering, automation pipelines, AI integration, and visual brand systems aligned under one transparent workflow.',
    '{}'::jsonb,
    true
  )
ON CONFLICT (page_key, section_key) DO NOTHING;

