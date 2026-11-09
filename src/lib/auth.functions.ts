import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(128),
  fullName: z.string().trim().min(1).max(120),
});

/** Creates confirmed email/password accounts without sending a verification email. */
export const createConfirmedAccount = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.toLowerCase(),
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });

    if (error || !created.user) {
      console.error("confirmed account creation failed", error?.message);
      return {
        ok: false as const,
        error: "We couldn't create that account. Check your details or try signing in.",
      };
    }

    return { ok: true as const };
  });
