-- ELEVANTE Phase 3 Migration 0003: Supabase Storage Buckets & Access Policies

-- 1. Create Segmented Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'public-media',
    'public-media',
    true,
    52428800,
    ARRAY[
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'application/pdf'
    ]
  ),
  (
    'project-attachments',
    'project-attachments',
    false,
    26214400,
    ARRAY[
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  ),
  (
    'project-deliverables',
    'project-deliverables',
    false,
    104857600,
    ARRAY[
      'image/png',
      'image/jpeg',
      'image/webp',
      'video/mp4',
      'application/pdf',
      'text/csv',
      'application/zip',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Object RLS Policies (`storage.objects`)
-- Path Convention for Private Buckets:
--   project-attachments: {project_id}/{uploader_uid}/{uuid}-{filename}
--   project-deliverables: {project_id}/{uuid}-{filename}

-- public-media: public read, admin write
CREATE POLICY "Public reads public-media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'public-media');

CREATE POLICY "Admin uploads public-media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'public-media' AND public.is_admin());

CREATE POLICY "Admin updates public-media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'public-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'public-media' AND public.is_admin());

CREATE POLICY "Admin deletes public-media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'public-media' AND public.is_admin());

-- project-attachments: private project-scoped access
CREATE POLICY "Project members read project-attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-attachments' AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.project_requests pr
        WHERE pr.id::text = (storage.foldername(name))[1]
          AND (
            pr.customer_id = (SELECT auth.uid())
            OR (public.current_user_role() = 'staff' AND pr.assigned_to = (SELECT auth.uid()))
          )
      )
    )
  );

CREATE POLICY "Project members upload project-attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-attachments'
    AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.project_requests pr
        WHERE pr.id::text = (storage.foldername(name))[1]
          AND (
            pr.customer_id = (SELECT auth.uid())
            OR (public.current_user_role() = 'staff' AND pr.assigned_to = (SELECT auth.uid()))
          )
      )
    )
  );

CREATE POLICY "Admin deletes project-attachments" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'project-attachments' AND public.is_admin());

-- project-deliverables: admin/staff upload; owning customer reads only accessible deliverables
CREATE POLICY "Authorized users read project-deliverables" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-deliverables' AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.project_requests pr
        WHERE pr.id::text = (storage.foldername(name))[1]
          AND public.current_user_role() = 'staff'
          AND pr.assigned_to = (SELECT auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.deliverables d
        JOIN public.project_requests pr ON pr.id = d.project_id
        WHERE d.storage_path = name
          AND d.is_customer_accessible = true
          AND pr.customer_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "Admin and assigned staff upload project-deliverables" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-deliverables' AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.project_requests pr
        WHERE pr.id::text = (storage.foldername(name))[1]
          AND public.current_user_role() = 'staff'
          AND pr.assigned_to = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "Admin deletes project-deliverables" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'project-deliverables' AND public.is_admin());

