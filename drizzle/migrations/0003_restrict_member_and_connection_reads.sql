DROP POLICY IF EXISTS "membership readable" ON public.elite_members;
CREATE POLICY "read own membership" ON public.elite_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins read memberships" ON public.elite_members FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE VIEW public.member_badges AS
  SELECT user_id, founding_number FROM public.elite_members;
REVOKE ALL ON public.member_badges FROM anon;
GRANT SELECT ON public.member_badges TO authenticated;

DROP POLICY IF EXISTS "connections readable" ON public.connections;
CREATE POLICY "read own connections" ON public.connections FOR SELECT TO authenticated USING (follower_id = auth.uid() OR following_id = auth.uid());