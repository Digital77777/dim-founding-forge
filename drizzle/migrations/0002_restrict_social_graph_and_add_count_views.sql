-- follows: members can only read their own follow graph
DROP POLICY IF EXISTS "Members can view follows" ON public.follows;
CREATE POLICY "Members can view own follows"
  ON public.follows FOR SELECT TO authenticated
  USING (auth.uid() = follower_id);

-- likes: raw rows stay private to the member who liked; visible counts move to a view
DROP POLICY IF EXISTS "likes readable" ON public.likes;
CREATE POLICY "Members can view own likes"
  ON public.likes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- feedback_votes: same approach
DROP POLICY IF EXISTS "votes readable" ON public.feedback_votes;
CREATE POLICY "Members can view own votes"
  ON public.feedback_votes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Aggregate counts the app displays next to posts and feedback items
CREATE OR REPLACE VIEW public.like_counts AS
  SELECT post_id, count(*)::integer AS like_count
  FROM public.likes
  GROUP BY post_id;
COMMENT ON VIEW public.like_counts IS 'Aggregate like count per post; safe to show to members.';

CREATE OR REPLACE VIEW public.feedback_vote_counts AS
  SELECT item_id, count(*)::integer AS vote_count
  FROM public.feedback_votes
  GROUP BY item_id;
COMMENT ON VIEW public.feedback_vote_counts IS 'Aggregate vote count per feedback item; safe to show to members.';

GRANT SELECT ON public.like_counts TO authenticated;
GRANT SELECT ON public.feedback_vote_counts TO authenticated;