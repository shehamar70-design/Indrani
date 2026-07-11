"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { FormAlert, SubmitButton } from "../ui";

/**
 * /verify (docs/13 §2) — two modes:
 *  - `?token=` present: consume the verification token, then send to sign-in.
 *  - no token: post-registration notice; unverified users can resend the email
 *    (link is logged server-side in dev — approved no-SMTP decision).
 */
export function VerifyClient() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const next = params.get("next") ?? "/";
  const { data: session } = useSession();

  const [state, setState] = useState<"idle" | "verifying" | "failed" | "sent">(
    token ? "verifying" : "idle",
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!token) return;
    authClient.verifyEmail({ query: { token } }).then(({ error }) => {
      if (error) setState("failed");
      else router.push("/login?verified=1");
    });
  }, [token, router]);

  if (token && state !== "failed") {
    return <p className="text-sm text-muted-foreground">Verifying your email…</p>;
  }

  async function resend() {
    if (!session?.user.email) return;
    setPending(true);
    await authClient.sendVerificationEmail({ email: session.user.email });
    setPending(false);
    setState("sent");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Verify your email</h1>
      {state === "failed" && (
        <FormAlert tone="error">This verification link is invalid or has expired.</FormAlert>
      )}
      {state === "sent" && (
        <FormAlert tone="success">Verification email sent — check your inbox.</FormAlert>
      )}
      {session?.user.emailVerified ? (
        <FormAlert tone="success">Your email is verified. You&apos;re all set.</FormAlert>
      ) : (
        <FormAlert tone="info">
          We sent a verification link to{" "}
          <span className="font-medium">{session?.user.email ?? "your email"}</span>. You can keep
          using Indrani, but some features need a verified email.
        </FormAlert>
      )}
      {session && !session.user.emailVerified && (
        <form action={resend}>
          <SubmitButton pending={pending}>Resend verification email</SubmitButton>
        </form>
      )}
      <p className="text-center text-sm text-muted-foreground">
        <Link href={next} className="font-medium text-foreground underline underline-offset-2 hover:text-brand">
          Continue to Indrani
        </Link>
      </p>
    </div>
  );
}
