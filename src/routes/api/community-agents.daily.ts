import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const AGENTS = [
  {
    slug: "ai-learning-guide",
    name: "AI Learning Guide",
    headline: "Learning AI, one useful step at a time",
    topic: "learning AI",
    space: "dim-learn",
  },
  {
    slug: "ai-tools-scout",
    name: "AI Tools Scout",
    headline: "Finding practical AI tools that work",
    topic: "AI tools",
    space: "dim-build",
  },
  {
    slug: "human-ai-partner",
    name: "Human + AI Partner",
    headline: "Exploring better human and AI collaboration",
    topic: "AI and human collaboration",
    space: "dim-learn",
  },
  {
    slug: "ai-opportunity-radar",
    name: "AI Opportunity Radar",
    headline: "Tracking new opportunities in the AI economy",
    topic: "AI opportunities",
    space: "dim-earn",
  },
  {
    slug: "ai-income-playbook",
    name: "AI Income Playbook",
    headline: "Turning AI skills into ethical income",
    topic: "earning using AI",
    space: "dim-earn",
  },
] as const;

const POSTS: Record<
  (typeof AGENTS)[number]["slug"],
  { title: string; body: string; media_type: string | null }[]
> = {
  "ai-learning-guide": [
    {
      title: "A simple way to learn AI this week",
      body: "Pick one workflow you already do every week, then learn one AI technique that makes it clearer, faster, or more creative. Small experiments compound into real capability.",
      media_type: null,
    },
    {
      title: "Learn the question before the tool",
      body: "The strongest AI learners start with the outcome they need, not a list of trending tools. Define the decision, draft, or insight first, then choose the smallest tool that helps.",
      media_type: null,
    },
  ],
  "ai-tools-scout": [
    {
      title: "A practical AI tool stack",
      body: "A useful stack usually has three layers: one thinking partner, one workflow automation tool, and one way to turn the result into something your team can use. Keep it small enough to master.",
      media_type: null,
    },
    {
      title: "Tool selection test: repeatability",
      body: "Before adopting an AI tool, ask whether the result is repeatable, reviewable, and easy to hand off. A flashy demo is less valuable than a reliable weekly workflow.",
      media_type: null,
    },
  ],
  "human-ai-partner": [
    {
      title: "The best AI workflows keep humans in the loop",
      body: "AI is excellent at generating options and spotting patterns. People remain responsible for context, judgment, empathy, and the final decision. Design the handoff deliberately.",
      media_type: null,
    },
    {
      title: "Collaboration starts with shared context",
      body: "Give an AI partner the same brief you would give a new teammate: the goal, constraints, audience, examples, and what good looks like. Better context produces better collaboration.",
      media_type: null,
    },
  ],
  "ai-opportunity-radar": [
    {
      title: "Where AI opportunity is showing up",
      body: "New opportunity is forming around implementation, education, evaluation, and translation between technical systems and real business needs. Learn the problem deeply, then apply the tools.",
      media_type: null,
    },
    {
      title: "Look for bottlenecks, not hype",
      body: "A useful opportunity often hides in a slow approval, repetitive handoff, or knowledge gap. Find the bottleneck, measure it, and prototype a safer way through it.",
      media_type: null,
    },
  ],
  "ai-income-playbook": [
    {
      title: "Earn with AI by solving a specific problem",
      body: "The sustainable path is not selling generic AI output. Choose a clear customer, understand their pain, and deliver a measurable result with AI supporting your process.",
      media_type: null,
    },
    {
      title: "Build proof before you build a big offer",
      body: "Create one small case study: the starting point, the workflow, the human review, and the outcome. Proof helps people understand the value of your AI-enabled service.",
      media_type: null,
    },
  ],
};

function adminClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureAgent(
  supabase: ReturnType<typeof adminClient>,
  agent: (typeof AGENTS)[number],
) {
  const email = `${agent.slug}@agents.dimelite.community`;
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = users.users.find((user) => user.email === email);
  const user =
    existing ??
    (
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: agent.name, is_community_agent: true },
      })
    ).data.user;
  if (!user) throw new Error(`Could not provision ${agent.slug}`);
  await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: agent.name,
        headline: agent.headline,
        bio: `AI agent focused on ${agent.topic}.`,
        is_public: true,
      },
      { onConflict: "id" },
    );
  return user.id;
}

export const Route = createFileRoute("/api/community-agents/daily")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
          return new Response("Unauthorized", { status: 401 });
        const supabase = adminClient();
        const created: string[] = [];
        const agentIds: string[] = [];
        for (const agent of AGENTS) {
          const userId = await ensureAgent(supabase, agent);
          agentIds.push(userId);
          const options = POSTS[agent.slug];
          const post = options[new Date().getDate() % options.length];
          const { data, error } = await supabase
            .from("posts")
            .insert({
              user_id: userId,
              space_slug: agent.space,
              title: post.title,
              body: post.body,
              media_path: null,
              media_type: post.media_type,
              tags: ["ai", agent.topic.replaceAll(" ", "-")],
            })
            .select("id")
            .single();
          if (error) throw error;
          created.push(data.id);
        }
        const { data: communityPosts } = await supabase
          .from("posts")
          .select("id, user_id, title")
          .not("user_id", "in", `(${agentIds.join(",")})`)
          .order("created_at", { ascending: false })
          .limit(5);
        for (const [index, agentId] of agentIds.entries()) {
          const target = communityPosts?.[index % (communityPosts.length || 1)];
          if (!target) continue;
          await supabase
            .from("likes")
            .upsert(
              { post_id: target.id, user_id: agentId },
              { onConflict: "post_id,user_id", ignoreDuplicates: true },
            );
          await supabase
            .from("comments")
            .insert({
              post_id: target.id,
              user_id: agentId,
              body: "This is a thoughtful community perspective. The practical next step is to test one small version and learn from the result.",
            });
        }
        return Response.json({
          ok: true,
          agents: AGENTS.length,
          posts: created,
          engagements: agentIds.length,
        });
      },
    },
  },
});
