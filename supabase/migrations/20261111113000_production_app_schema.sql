DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'member');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE IF NOT EXISTS public.elite_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  founding_number integer UNIQUE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  discovery_source text,
  last_active_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text,
  icon text,
  audience text,
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  category text NOT NULL,
  who_for text,
  use_cases text[] NOT NULL DEFAULT '{}',
  pricing text,
  skill_level text NOT NULL DEFAULT 'Beginner',
  url text,
  featured boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS public.goal_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  track text,
  tool_slugs text[] NOT NULL DEFAULT '{}',
  path_slug text,
  steps text[] NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  kind text,
  url text,
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.achievements (
  code text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  stage text,
  sort integer NOT NULL DEFAULT 0
);
INSERT INTO public.achievements (code, title, description, icon, stage, sort)
VALUES ('founding_member', 'Founding Member', 'One of the first members of the Digital Intelligence Marketplace.', 'award', 'community', 1)
ON CONFLICT (code) DO NOTHING;
CREATE TABLE IF NOT EXISTS public.community_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  stage text,
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.tool_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_slug)
);
CREATE TABLE IF NOT EXISTS public.tool_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_slug)
);
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  description text,
  status text NOT NULL DEFAULT 'in_progress',
  tags text[] NOT NULL DEFAULT '{}',
  tools text[] NOT NULL DEFAULT '{}',
  link text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.member_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_code text NOT NULL REFERENCES public.achievements(code) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_code)
);
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.coming_soon_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature)
);
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
CREATE TABLE IF NOT EXISTS public.feedback_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  status text NOT NULL DEFAULT 'received',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.feedback_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.feedback_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
CREATE TABLE IF NOT EXISTS public.career_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_key text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_key)
);
CREATE TABLE IF NOT EXISTS public.career_plans (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role text NOT NULL,
  experience_level text,
  experience_summary text,
  interests text[] NOT NULL DEFAULT '{}',
  learning_path text,
  portfolio_summary text,
  roadmap jsonb,
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  organisation text,
  enquiry_type text NOT NULL,
  message text NOT NULL,
  source_page text,
  status text NOT NULL DEFAULT 'received',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_path text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_type text CHECK (media_type IN ('image', 'video'));
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_url text;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, UPDATE ON public.elite_members TO authenticated;
GRANT SELECT ON public.elite_members TO anon;
GRANT SELECT ON public.learning_paths, public.ai_tools, public.goal_recommendations, public.resources,
  public.achievements, public.community_spaces TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_saves, public.tool_views, public.projects,
  public.member_achievements, public.notifications, public.coming_soon_interest,
  public.connections, public.feedback_items, public.feedback_votes, public.follows,
  public.career_milestones, public.career_plans TO authenticated;
GRANT SELECT ON public.projects, public.member_achievements TO anon;
GRANT ALL ON public.posts, public.comments, public.likes, public.courses, public.modules, public.lessons,
  public.enrollments, public.lesson_progress, public.profiles, public.conversations,
  public.conversation_members, public.messages, public.message_requests TO service_role;
GRANT ALL ON public.user_roles, public.elite_members, public.learning_paths, public.ai_tools,
  public.goal_recommendations, public.resources, public.achievements, public.community_spaces,
  public.tool_saves, public.tool_views, public.projects, public.member_achievements,
  public.notifications, public.coming_soon_interest, public.connections, public.feedback_items,
  public.feedback_votes, public.follows, public.career_milestones, public.career_plans,
  public.enquiries TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elite_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coming_soon_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own roles readable" ON public.user_roles;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "admins read roles" ON public.user_roles;
CREATE POLICY "admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin'));
DROP POLICY IF EXISTS "membership readable" ON public.elite_members;
CREATE POLICY "membership readable" ON public.elite_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "update own membership" ON public.elite_members;
CREATE POLICY "update own membership" ON public.elite_members FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

DO $$ DECLARE table_name text; BEGIN
  FOREACH table_name IN ARRAY ARRAY['learning_paths','ai_tools','goal_recommendations','resources','achievements','community_spaces'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'catalog readable', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)', 'catalog readable', table_name);
  END LOOP;
END $$;

DO $$ DECLARE table_name text; BEGIN
  FOREACH table_name IN ARRAY ARRAY['tool_saves','tool_views','notifications','coming_soon_interest','career_milestones','career_plans'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'own rows', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()))', 'own rows', table_name);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "public projects readable" ON public.projects;
CREATE POLICY "public projects readable" ON public.projects FOR SELECT TO anon, authenticated USING (is_public = true);
DROP POLICY IF EXISTS "own projects" ON public.projects;
CREATE POLICY "own projects" ON public.projects FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "admins read projects" ON public.projects;
CREATE POLICY "admins read projects" ON public.projects FOR SELECT TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin'));
DROP POLICY IF EXISTS "achievements readable" ON public.member_achievements;
CREATE POLICY "achievements readable" ON public.member_achievements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "own achievements write" ON public.member_achievements;
CREATE POLICY "own achievements write" ON public.member_achievements FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "own connections" ON public.connections;
CREATE POLICY "own connections" ON public.connections FOR ALL TO authenticated USING (follower_id = (SELECT auth.uid())) WITH CHECK (follower_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "feedback readable by members" ON public.feedback_items;
CREATE POLICY "feedback readable by members" ON public.feedback_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "own feedback write" ON public.feedback_items;
CREATE POLICY "own feedback write" ON public.feedback_items FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "own feedback update" ON public.feedback_items;
CREATE POLICY "own feedback update" ON public.feedback_items FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "admins manage feedback" ON public.feedback_items;
CREATE POLICY "admins manage feedback" ON public.feedback_items FOR UPDATE TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin')) WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));
DROP POLICY IF EXISTS "own votes" ON public.feedback_votes;
CREATE POLICY "own votes" ON public.feedback_votes FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "own follows readable" ON public.follows;
CREATE POLICY "own follows readable" ON public.follows FOR SELECT TO authenticated USING (follower_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "own follows insert" ON public.follows;
CREATE POLICY "own follows insert" ON public.follows FOR INSERT TO authenticated WITH CHECK (follower_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "own follows delete" ON public.follows;
CREATE POLICY "own follows delete" ON public.follows FOR DELETE TO authenticated USING (follower_id = (SELECT auth.uid()));

DO $$ DECLARE table_name text; BEGIN
  FOREACH table_name IN ARRAY ARRAY['projects','feedback_items','career_plans'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', table_name || '_updated', table_name);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', table_name || '_updated', table_name);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON public.enrollments (user_id);
CREATE INDEX IF NOT EXISTS lesson_progress_user_id_idx ON public.lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS tool_saves_user_id_idx ON public.tool_saves (user_id);
CREATE INDEX IF NOT EXISTS tool_views_user_id_idx ON public.tool_views (user_id);
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS member_achievements_user_id_idx ON public.member_achievements (user_id);
CREATE INDEX IF NOT EXISTS feedback_votes_item_id_idx ON public.feedback_votes (item_id);
CREATE INDEX IF NOT EXISTS feedback_votes_user_id_idx ON public.feedback_votes (user_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows (following_id);
CREATE INDEX IF NOT EXISTS career_milestones_user_id_idx ON public.career_milestones (user_id);
CREATE INDEX IF NOT EXISTS enquiries_email_created_idx ON public.enquiries (email, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS resources_catalog_unique_idx ON public.resources (hub, category, title);

CREATE OR REPLACE VIEW public.like_counts AS
  SELECT post_id, count(*)::integer AS like_count FROM public.likes GROUP BY post_id;
CREATE OR REPLACE VIEW public.feedback_vote_counts AS
  SELECT item_id, count(*)::integer AS vote_count FROM public.feedback_votes GROUP BY item_id;
CREATE OR REPLACE VIEW public.member_badges AS
  SELECT em.user_id, em.founding_number
  FROM public.elite_members em
  JOIN public.profiles p ON p.id = em.user_id
  WHERE p.is_public = true;
REVOKE ALL ON public.like_counts, public.feedback_vote_counts, public.member_badges FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.like_counts TO authenticated;
GRANT SELECT ON public.feedback_vote_counts TO authenticated;
GRANT SELECT ON public.member_badges TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.founding_spots_taken()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::integer FROM public.elite_members WHERE founding_number IS NOT NULL
$$;
CREATE OR REPLACE FUNCTION public.claim_membership(_full_name text DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  n integer;
  taken integer;
  base text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  base := coalesce(nullif(trim(_full_name), ''), 'member');
  base := lower(regexp_replace(base, '[^a-zA-Z0-9]+', '-', 'g'));
  base := trim(both '-' from base);
  IF base = '' THEN base := 'member'; END IF;
  INSERT INTO public.profiles (id, full_name, slug)
  VALUES (uid, nullif(trim(_full_name), ''), base || '-' || substr(uid::text, 1, 6))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'member') ON CONFLICT DO NOTHING;
  SELECT founding_number INTO n FROM public.elite_members WHERE user_id = uid;
  IF n IS NOT NULL THEN RETURN n; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('founding-membership'));
  SELECT count(*) INTO taken FROM public.elite_members WHERE founding_number IS NOT NULL;
  IF taken >= 1000 THEN
    INSERT INTO public.elite_members (user_id) VALUES (uid) ON CONFLICT (user_id) DO NOTHING;
    RETURN NULL;
  END IF;
  INSERT INTO public.elite_members (user_id, founding_number)
  VALUES (uid, taken + 1)
  ON CONFLICT (user_id) DO UPDATE SET founding_number = coalesce(public.elite_members.founding_number, excluded.founding_number)
  RETURNING founding_number INTO n;
  INSERT INTO public.member_achievements (user_id, achievement_code)
  VALUES (uid, 'founding_member') ON CONFLICT DO NOTHING;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE ALL ON FUNCTION public.claim_membership(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_membership(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.founding_spots_taken() TO anon, authenticated;

REVOKE ALL ON public.enquiries FROM anon, authenticated;
REVOKE ALL ON public.follows FROM anon, PUBLIC;
REVOKE ALL ON public.likes FROM anon, PUBLIC;
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
NOTIFY pgrst, 'reload schema';
