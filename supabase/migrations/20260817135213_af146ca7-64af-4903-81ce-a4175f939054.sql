-- ===== roles =====
create type public.app_role as enum ('admin','moderator','member');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins read roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ===== profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text unique,
  full_name text,
  headline text,
  bio text,
  avatar_url text,
  location text,
  institution text,
  industry text,
  experience_level text,
  career_goal text,
  goals text[] not null default '{}',
  interests text[] not null default '{}',
  skills text[] not null default '{}',
  certifications text[] not null default '{}',
  links jsonb not null default '{}',
  is_public boolean not null default true,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "public profiles readable" on public.profiles for select using (is_public = true);
create policy "own profile readable" on public.profiles for select to authenticated using (id = auth.uid());
create policy "admins read profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

-- ===== elite membership =====
create table public.elite_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  founding_number integer unique,
  joined_at timestamptz not null default now(),
  discovery_source text,
  last_active_at timestamptz not null default now()
);
grant select, insert, update on public.elite_members to authenticated;
grant select on public.elite_members to anon;
grant all on public.elite_members to service_role;
alter table public.elite_members enable row level security;
create policy "membership readable" on public.elite_members for select using (true);
create policy "update own membership" on public.elite_members for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.founding_spots_taken()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.elite_members where founding_number is not null
$$;
grant execute on function public.founding_spots_taken() to anon, authenticated;

create or replace function public.claim_membership(_full_name text default null)
returns integer language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n integer; taken integer; base text;
begin
  if uid is null then raise exception 'not authenticated'; end if;

  base := coalesce(nullif(trim(_full_name),''), 'member');
  base := lower(regexp_replace(base, '[^a-zA-Z0-9]+', '-', 'g'));
  base := trim(both '-' from base);
  if base = '' then base := 'member'; end if;

  insert into public.profiles (id, full_name, slug)
  values (uid, nullif(trim(_full_name),''), base || '-' || substr(uid::text,1,6))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role) values (uid, 'member') on conflict do nothing;

  select founding_number into n from public.elite_members where user_id = uid;
  if n is not null then return n; end if;

  select count(*) into taken from public.elite_members where founding_number is not null;
  if taken >= 1000 then
    insert into public.elite_members (user_id) values (uid) on conflict (user_id) do nothing;
    return null;
  end if;

  insert into public.elite_members (user_id, founding_number)
  values (uid, taken + 1)
  on conflict (user_id) do update set founding_number = coalesce(public.elite_members.founding_number, excluded.founding_number)
  returning founding_number into n;

  insert into public.member_achievements (user_id, achievement_code)
  values (uid, 'founding_member') on conflict do nothing;

  return n;
end $$;

-- ===== learning =====
create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  icon text,
  audience text,
  sort integer not null default 0
);
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  path_slug text,
  title text not null,
  description text,
  category text,
  level text not null default 'Beginner',
  duration_minutes integer not null default 60,
  hub text,
  sort integer not null default 0
);
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  title text not null,
  summary text,
  sort integer not null default 0
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  content text,
  duration_minutes integer not null default 10,
  sort integer not null default 0
);
create table public.ai_tools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  category text not null,
  who_for text,
  use_cases text[] not null default '{}',
  pricing text,
  skill_level text not null default 'Beginner',
  url text,
  featured boolean not null default false
);
create table public.goal_recommendations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  description text,
  track text,
  tool_slugs text[] not null default '{}',
  path_slug text,
  steps text[] not null default '{}'
);
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  hub text not null,
  category text not null,
  title text not null,
  description text,
  kind text,
  url text,
  sort integer not null default 0
);
create table public.achievements (
  code text primary key,
  title text not null,
  description text not null,
  icon text,
  stage text,
  sort integer not null default 0
);
create table public.community_spaces (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  stage text,
  sort integer not null default 0
);

grant select on public.learning_paths, public.courses, public.modules, public.lessons,
  public.ai_tools, public.goal_recommendations, public.resources, public.achievements,
  public.community_spaces to anon, authenticated;
grant all on public.learning_paths, public.courses, public.modules, public.lessons,
  public.ai_tools, public.goal_recommendations, public.resources, public.achievements,
  public.community_spaces to service_role;

alter table public.learning_paths enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.ai_tools enable row level security;
alter table public.goal_recommendations enable row level security;
alter table public.resources enable row level security;
alter table public.achievements enable row level security;
alter table public.community_spaces enable row level security;

create policy "catalog readable" on public.learning_paths for select using (true);
create policy "catalog readable" on public.courses for select using (true);
create policy "catalog readable" on public.modules for select using (true);
create policy "catalog readable" on public.lessons for select using (true);
create policy "catalog readable" on public.ai_tools for select using (true);
create policy "catalog readable" on public.goal_recommendations for select using (true);
create policy "catalog readable" on public.resources for select using (true);
create policy "catalog readable" on public.achievements for select using (true);
create policy "catalog readable" on public.community_spaces for select using (true);

-- ===== member activity =====
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_slug)
);
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  course_slug text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create table public.tool_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, tool_slug)
);
create table public.tool_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, tool_slug)
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text,
  description text,
  status text not null default 'in_progress',
  tags text[] not null default '{}',
  tools text[] not null default '{}',
  link text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.member_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_code text not null references public.achievements(code) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_code)
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.coming_soon_interest (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  created_at timestamptz not null default now(),
  unique (user_id, feature)
);
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id)
);

grant select, insert, update, delete on public.enrollments, public.lesson_progress,
  public.tool_saves, public.tool_views, public.projects, public.member_achievements,
  public.notifications, public.coming_soon_interest, public.connections to authenticated;
grant select on public.projects, public.member_achievements, public.connections to anon;
grant all on public.enrollments, public.lesson_progress, public.tool_saves, public.tool_views,
  public.projects, public.member_achievements, public.notifications,
  public.coming_soon_interest, public.connections to service_role;

alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.tool_saves enable row level security;
alter table public.tool_views enable row level security;
alter table public.projects enable row level security;
alter table public.member_achievements enable row level security;
alter table public.notifications enable row level security;
alter table public.coming_soon_interest enable row level security;
alter table public.connections enable row level security;

create policy "own rows" on public.enrollments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins read" on public.enrollments for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "own rows" on public.lesson_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins read" on public.lesson_progress for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "own rows" on public.tool_saves for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.tool_views for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.notifications for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.coming_soon_interest for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "public projects readable" on public.projects for select using (is_public = true);
create policy "own projects" on public.projects for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins read projects" on public.projects for select to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "achievements readable" on public.member_achievements for select using (true);
create policy "own achievements write" on public.member_achievements for insert to authenticated with check (user_id = auth.uid());

create policy "connections readable" on public.connections for select using (true);
create policy "own connections" on public.connections for all to authenticated using (follower_id = auth.uid()) with check (follower_id = auth.uid());

create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();

-- ===== community =====
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_slug text not null,
  title text,
  body text not null,
  created_at timestamptz not null default now()
);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
grant select, insert, update, delete on public.posts, public.comments, public.likes to authenticated;
grant select on public.posts, public.comments, public.likes to anon;
grant all on public.posts, public.comments, public.likes to service_role;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
create policy "posts readable" on public.posts for select using (true);
create policy "own posts" on public.posts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "comments readable" on public.comments for select using (true);
create policy "own comments" on public.comments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "likes readable" on public.likes for select using (true);
create policy "own likes" on public.likes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ===== beta feedback =====
create table public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  status text not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.feedback_votes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.feedback_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (item_id, user_id)
);
grant select, insert, update, delete on public.feedback_items, public.feedback_votes to authenticated;
grant all on public.feedback_items, public.feedback_votes to service_role;
alter table public.feedback_items enable row level security;
alter table public.feedback_votes enable row level security;
create policy "feedback readable by members" on public.feedback_items for select to authenticated using (true);
create policy "own feedback write" on public.feedback_items for insert to authenticated with check (user_id = auth.uid());
create policy "own feedback update" on public.feedback_items for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins manage feedback" on public.feedback_items for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "votes readable" on public.feedback_votes for select to authenticated using (true);
create policy "own votes" on public.feedback_votes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger feedback_updated before update on public.feedback_items for each row execute function public.set_updated_at();