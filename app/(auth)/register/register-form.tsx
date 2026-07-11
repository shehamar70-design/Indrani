"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Field, FormAlert, SubmitButton } from "../ui";

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(100),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

/** Rough strength hint (docs/13 §2) — informational only, server enforces min 8. */
function strengthHint(pw: string): string {
  if (!pw) return "At least 8 characters.";
  let score = 0;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return ["Weak password", "Fair password", "Good password", "Strong password", "Very strong password"][score];
}

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [pw, setPw] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const form = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      confirm: form.get("confirm"),
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      ));
      return;
    }
    setErrors({});
    setPending(true);
    const { name, email, password } = parsed.data;
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      setPending(false);
      setFormError(
        error.code === "USER_ALREADY_EXISTS"
          ? "An account with this email already exists."
          : error.status === 429
            ? "Too many attempts. Try again in a few minutes."
            : (error.message ?? "Could not create the account."),
      );
      return;
    }
    router.push("/verify"); // signed in; show the verification notice
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h1 className="text-xl font-semibold text-foreground">Create account</h1>
      {formError && <FormAlert tone="error">{formError}</FormAlert>}
      <Field id="name" name="name" type="text" label="Name" autoComplete="name" error={errors.name} required />
      <Field id="email" name="email" type="email" label="Email" autoComplete="email" error={errors.email} required />
      <Field
        id="password" name="password" type="password" label="Password"
        autoComplete="new-password" error={errors.password} hint={strengthHint(pw)}
        onChange={(e) => setPw(e.target.value)} required
      />
      <Field id="confirm" name="confirm" type="password" label="Confirm password" autoComplete="new-password" error={errors.confirm} required />
      <SubmitButton pending={pending}>Create account</SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-2 hover:text-brand">
          Sign in
        </Link>
      </p>
    </form>
  );
}
