import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import { FOUNDING_CAP } from "./dim";

/** Public founding-spot counter for the landing page (no session required). */
export const getFoundingStats = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return { taken: 0, remaining: FOUNDING_CAP, cap: FOUNDING_CAP };

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.rpc("founding_spots_taken");
  const taken = error || typeof data !== "number" ? 0 : data;
  return { taken, remaining: Math.max(FOUNDING_CAP - taken, 0), cap: FOUNDING_CAP };
});
