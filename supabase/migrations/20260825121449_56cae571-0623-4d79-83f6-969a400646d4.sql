ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS media_path text,
  ADD COLUMN IF NOT EXISTS media_type text CHECK (media_type IN ('image','video')),
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

DROP POLICY IF EXISTS "Members can view community media" ON storage.objects;
CREATE POLICY "Members can view community media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'community-media');

DROP POLICY IF EXISTS "Members can upload their own community media" ON storage.objects;
CREATE POLICY "Members can upload their own community media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Members can delete their own community media" ON storage.objects;
CREATE POLICY "Members can delete their own community media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'community-media' AND (storage.foldername(name))[1] = auth.uid()::text);