import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enquirySchema, submitEnquiry } from "@/lib/enquiry.functions";
import { ENQUIRY_TYPES } from "@/lib/site";

type Errors = Partial<Record<"name" | "email" | "enquiryType" | "message" | "form", string>>;

export function EnquiryForm({ defaultType, sourcePage }: { defaultType?: (typeof ENQUIRY_TYPES)[number]; sourcePage: string }) {
  const send = useServerFn(submitEnquiry);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      organisation: String(fd.get("organisation") ?? ""),
      enquiryType: String(fd.get("enquiryType") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
      sourcePage,
    };
    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !next[key]) next[key] = key === "enquiryType" ? "Please choose an enquiry type." : issue.message;
      }
      if (payload.website) next.form = "Your enquiry couldn't be sent.";
      setErrors(next);
      return;
    }
    setErrors({});
    setState("sending");
    try {
      const res = await send({ data: parsed.data });
      if (res.ok) {
        setState("sent");
        return;
      }
      setErrors({ form: res.error });
    } catch {
      setErrors({ form: "We couldn't send your enquiry. Please check your connection and try again." });
    }
    setState("idle");
  }

  if (state === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-accent/40 bg-accent/10 p-6">
        <CheckCircle2 className="size-6 text-accent" aria-hidden />
        <p className="mt-3 font-display text-xl font-bold">Thank you — your enquiry has been received.</p>
        <p className="mt-2 text-sm text-muted-foreground">The DIM team will review it and reply to the email address you provided.</p>
      </div>
    );
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-1.5 text-sm text-destructive">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-lift sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" className="mt-1.5" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
          {err("name")}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
          {err("email")}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="organisation">Organisation (optional)</Label>
          <Input id="organisation" name="organisation" autoComplete="organization" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="enquiryType">Enquiry type</Label>
          <select
            id="enquiryType"
            name="enquiryType"
            defaultValue={defaultType ?? ""}
            aria-invalid={!!errors.enquiryType}
            className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="" disabled>
              Choose one
            </option>
            {ENQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {err("enquiryType")}
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} className="mt-1.5" aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
        {err("message")}
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {errors.form ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.form}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={state === "sending"} className="bg-ember text-primary-foreground shadow-glow">
          {state === "sending" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            "Send enquiry"
          )}
        </Button>
        <p className="text-xs text-muted-foreground">We use your details only to respond to this enquiry.</p>
      </div>
    </form>
  );
}
