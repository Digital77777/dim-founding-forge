ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.posts, public.comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.posts, public.comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;

DROP POLICY IF EXISTS "posts readable" ON public.posts;
DROP POLICY IF EXISTS "own posts" ON public.posts;
CREATE POLICY "posts readable" ON public.posts
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "own posts" ON public.posts
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "comments readable" ON public.comments;
DROP POLICY IF EXISTS "own comments" ON public.comments;
CREATE POLICY "comments readable" ON public.comments
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "own comments" ON public.comments
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "likes readable" ON public.likes;
DROP POLICY IF EXISTS "own likes" ON public.likes;
CREATE POLICY "own likes" ON public.likes
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes (user_id);
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON public.likes (post_id);
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts (user_id);
