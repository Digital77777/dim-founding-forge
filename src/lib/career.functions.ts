import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { generateCareerRoadmap, GatewayError } = await import("./ai/career-ai.server");

    const [planRes, profileRes, projectsRes] = await Promise.all([
      supabase.from("career_plans").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("skills, certifications, headline, industry").eq("id", userId).maybeSingle(),
      supabase.from("projects").select("title, summary, tools").eq("user_id", userId).limit(10),
    ]);
    const plan = planRes.data;
    if (!plan) return { ok: false as const, error: "Set your career goal first." };

    const p = profileRes.data;
    const input = [
      `Target role: ${plan.target_role}`,
      `Experience level: ${plan.experience_level ?? "not given"}`,
      `Experience: ${plan.experience_summary ?? "not given"}`,
      `Interests: ${plan.interests.join(", ") || "not given"}`,
      `Preferred learning style: ${plan.learning_path ?? "not given"}`,
      `Skills: ${p?.skills?.join(", ") || "none listed"}`,
      `Certifications: ${p?.certifications?.join(", ") || "none"}`,
      `Industry: ${p?.industry ?? "n/a"}; Headline: ${p?.headline ?? "n/a"}`,
      `Portfolio notes: ${plan.portfolio_summary ?? "none"}`,
      `Projects: ${(projectsRes.data ?? []).map((x) => `${x.title} (${x.tools.join(", ")})`).join("; ") || "none yet"}`,
    ].join("\n");

    try {
      const roadmap = await generateCareerRoadmap(input);
      const { error } = await supabase
        .from("career_plans")
        .update({ roadmap, generated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) return { ok: false as const, error: "Couldn't save your roadmap." };
      await supabase.from("career_milestones").delete().eq("user_id", userId);
      return { ok: true as const, roadmap };
    } catch (err) {
      const message = err instanceof GatewayError ? err.message : "Something went wrong creating your roadmap.";
      console.error("roadmap generation failed", err);
      return { ok: false as const, error: message };
    }
  });
