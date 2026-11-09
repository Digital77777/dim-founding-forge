import { streamText, gateway } from "ai";
import { z } from "zod";

export const STAGE_KEYS = [
  "discover",
  "assess",
  "learn",
  "build",
  "certify",
  "showcase",
  "prepare",
  "connect",
  "apply",
  "grow",
] as const;

export const FEATURE_ROUTES = [
  "/learn",
  "/build",
  "/tools",
  "/portfolio",
  "/profile",
  "/community",
  "/connect",
  "/achievements",
  "/progress",
] as const;

const roadmapSchema = z.object({
  summary: z.string(),
  milestones: z.array(
    z.object({
      stage: z.string(),
      title: z.string(),
      detail: z.string(),
    }),
  ),
  next_steps: z.array(
    z.object({
      title: z.string(),
      why: z.string(),
      route: z.string(),
    }),
  ),
});

export type CareerRoadmap = {
  summary: string;
  milestones: { id: string; stage: (typeof STAGE_KEYS)[number]; title: string; detail: string }[];
  next_steps: { title: string; why: string; route: (typeof FEATURE_ROUTES)[number] }[];
};

export class GatewayError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function generateCareerRoadmap(input: string): Promise<CareerRoadmap> {
  const system = `You are DIM Career's advisor. Build an honest, practical career roadmap for the member.
Return ONLY a JSON object, no markdown, with this shape:
{"summary": string (2-3 sentences),
 "milestones": [{"stage": one of ${STAGE_KEYS.join("|")}, "title": string (max 8 words), "detail": string (1-2 sentences)}],
 "next_steps": [{"title": string, "why": string (1 sentence), "route": one of ${FEATURE_ROUTES.join("|")}}]}
Give 10-14 milestones ordered through the stages from discover to grow (at least one per stage), and exactly 3 next_steps.
Recognised certifications (AWS, Microsoft, Google Cloud, etc.) may be suggested but never claim DIM issues them. Never promise jobs or outcomes. Do not invent employers or specific openings.`;

  let text: string;
  try {
    const result = streamText({
      model: gateway("google/gemini-3-flash"),
      system,
      prompt: input,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    text = await result.text;
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    if (status === 429)
      throw new GatewayError(429, "The AI advisor is busy. Please try again in a minute.");
    if (status === 402) throw new GatewayError(402, "AI credits have run out for this workspace.");
    if (status === 403)
      throw new GatewayError(403, "AI access is currently blocked for this workspace.");
    throw new GatewayError(
      status,
      "The AI advisor couldn't create your roadmap. Please try again.",
    );
  }

  const match = text.match(/\{[\s\S]*\}/);
  let parsed: z.infer<typeof roadmapSchema>;
  try {
    parsed = roadmapSchema.parse(JSON.parse(match?.[0] ?? ""));
  } catch {
    throw new GatewayError(502, "The AI returned an unreadable roadmap. Please try again.");
  }

  const stages = STAGE_KEYS as readonly string[];
  const routes = FEATURE_ROUTES as readonly string[];
  return {
    summary: parsed.summary.slice(0, 600),
    milestones: parsed.milestones.slice(0, 16).map((m, i) => ({
      id: `m${i + 1}`,
      stage: (stages.includes(m.stage)
        ? m.stage
        : "grow") as CareerRoadmap["milestones"][number]["stage"],
      title: m.title.slice(0, 80),
      detail: m.detail.slice(0, 300),
    })),
    next_steps: parsed.next_steps.slice(0, 3).map((s) => ({
      title: s.title.slice(0, 100),
      why: s.why.slice(0, 240),
      route: (routes.includes(s.route)
        ? s.route
        : "/learn") as CareerRoadmap["next_steps"][number]["route"],
    })),
  };
}
