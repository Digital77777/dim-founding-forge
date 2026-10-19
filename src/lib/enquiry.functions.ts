import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ENQUIRY_TYPES } from "./site";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  organisation: z.string().trim().max(160).optional().default(""),
  enquiryType: z.enum(ENQUIRY_TYPES),
  message: z.string().trim().min(10, "Please tell us a little more (at least 10 characters).").max(4000),
  sourcePage: z.string().max(120).optional().default(""),
  /** Honeypot: real visitors never fill this hidden field. */
  website: z.string().max(0).optional().default(""),
});

export type EnquiryInput = z.input<typeof enquirySchema>;

/** Public enquiry submission. Validates input, drops bots, rate-limits per email, stores privately. */
export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => enquirySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", since);
    if ((count ?? 0) >= 3) {
      return { ok: false as const, error: "You've sent several enquiries recently. Please try again later." };
    }

    const { error } = await supabaseAdmin.from("enquiries").insert({
      name: data.name,
      email,
      organisation: data.organisation || null,
      enquiry_type: data.enquiryType,
      message: data.message,
      source_page: data.sourcePage || null,
    });
    if (error) {
      console.error("enquiry insert failed", error.message);
      return { ok: false as const, error: "We couldn't send your enquiry. Please try again." };
    }
    return { ok: true as const };
  });
