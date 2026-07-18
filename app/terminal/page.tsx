/**
 * /terminal — honest placeholder (docs/44 §1.4, §9). The Terminal app is
 * docs/36 Phase 3 and deliberately out of scope for the news build; this
 * route exists so the header CTA never 404s, and states plainly what it is.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terminal — Indrani",
  description:
    "Indrani Terminal — a keyboard-first market workspace. In development.",
  robots: { index: false },
};

export default function TerminalPage() {
  return (
    <div className="terminal-dark flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Indrani Terminal
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">In development</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The keyboard-first market workspace — command line, live quotes,
        screeners and alerts — is being built. It is not available yet.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/markets"
          className="rounded bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          Explore Markets →
        </Link>
        <Link
          href="/"
          className="rounded border border-border px-4 py-2 text-sm font-semibold"
        >
          Indrani News
        </Link>
      </div>
    </div>
  );
}
