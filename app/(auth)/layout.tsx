import Link from "next/link";

/** Auth surface — news-site light theme, centered card (docs/13 §4). */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 select-none text-center">
        <span className="font-serif text-4xl font-semibold tracking-tight text-foreground">
          Indrani
        </span>
        <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Markets · News · Terminal
        </span>
      </Link>
      <main className="w-full max-w-[400px] rounded border border-border bg-card p-8 shadow-sm">
        {children}
      </main>
    </div>
  );
}
