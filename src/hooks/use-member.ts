import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  slug: string | null;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  institution: string | null;
  industry: string | null;
  experience_level: string | null;
  career_goal: string | null;
  goals: string[];
  interests: string[];
  skills: string[];
  certifications: string[];
  is_public: boolean;
  onboarding_completed: boolean;
  created_at: string;
};

export type Membership = {
  user_id: string;
  founding_number: number | null;
  joined_at: string;
};

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setUser(session?.user ?? null);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

/** Profile + Founding membership + earned achievements for the signed-in member. */
export function useMember() {
  const { user, loading } = useAuthUser();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ["member", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [profileRes, memberRes, achievementRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("elite_members").select("*").eq("user_id", userId!).maybeSingle(),
        supabase.from("member_achievements").select("achievement_code, earned_at").eq("user_id", userId!),
      ]);
      return {
        profile: (profileRes.data as Profile | null) ?? null,
        membership: (memberRes.data as Membership | null) ?? null,
        earned: (achievementRes.data ?? []) as { achievement_code: string; earned_at: string }[],
      };
    },
  });

  return {
    user,
    userId,
    isLoading: loading || query.isLoading,
    profile: query.data?.profile ?? null,
    membership: query.data?.membership ?? null,
    earned: query.data?.earned ?? [],
    refetch: query.refetch,
  };
}

export function useInvalidateMember() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["member"] });
}

export function firstName(profile: Profile | null, user: User | null) {
  const name = profile?.full_name ?? (user?.user_metadata?.["full_name"] as string | undefined) ?? "";
  return name.trim().split(" ")[0] || "there";
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
