CREATE TABLE public.career_plans (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_plans TO authenticated;
GRANT ALL ON public.career_plans TO service_role;
ALTER TABLE public.career_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own career plan" ON public.career_plans FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER career_plans_updated BEFORE UPDATE ON public.career_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.career_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_key text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_key)
);
GRANT SELECT, INSERT, DELETE ON public.career_milestones TO authenticated;
GRANT ALL ON public.career_milestones TO service_role;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own milestones" ON public.career_milestones FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);