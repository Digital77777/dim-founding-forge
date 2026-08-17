import { supabase } from "@/integrations/supabase/client";

/**
 * Award an achievement if the member does not already have it, and drop a
 * notification. Safe to call repeatedly — the unique constraint makes it a
 * no-op the second time.
 */
export async function awardAchievement(userId: string, code: string, title: string) {
  const { error } = await supabase
    .from("member_achievements")
    .insert({ user_id: userId, achievement_code: code });
  if (error) return false;
  await notify(userId, {
    type: "achievement",
    title: `Achievement unlocked: ${title}`,
    body: "View it on your achievements page.",
    link: "/achievements",
  });
  return true;
}

export async function notify(
  userId: string,
  input: { type: string; title: string; body?: string; link?: string },
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
  });
}

export async function touchActivity(userId: string) {
  await supabase
    .from("elite_members")
    .update({ last_active_at: new Date().toISOString() })
    .eq("user_id", userId);
}
