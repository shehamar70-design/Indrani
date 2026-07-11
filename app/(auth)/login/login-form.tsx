"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Field, FormAlert, SubmitButton } from "../ui";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password is at least 8 characters"),
});

/** Only allow same-origin relative paths as post-login targets. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const justVerified = params.get("verified") === "1";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      ));
      return;
    }
    setErrors({});
    setPending(true);
    const { data, error } = await authClient.signIn.email(parsed.data);
    if (error) {
      setPending(false);
      setFormError(
        error.status === 429
          ? "Too many attempts. Try again in a few minutes."
          : "Invalid email or password.",
      );
      return;
    }
    const dest = safeNext(params.get("next"));
    // Approved decision: unverified users may sign in; the shell shows a
    // "verify your email" banner. Route them via /verify so they see it once.
    router.push(data.user.emailVerified ? dest : `/verify?next=${encodeURIComponent(dest)}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
      {justVerified && <FormAlert tone="success">Email verified — sign in to continue.</FormAlert>}
      {formError && <FormAlert tone="error">{formError}</FormAlert>}
      <Field id="email" name="email" type="email" label="Email" autoComplete="email" error={errors.email} required />
      <Field id="password" name="password" type="password" label="Password" autoComplete="current-password" error={errors.password} required />
      <SubmitButton pending={pending}>Sign in</SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="font-medium text-foreground underline underline-offset-2 hover:text-brand">
          Create one
        </Link>
      </p>
    </form>
  );
}
