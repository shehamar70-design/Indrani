"use client";

/**
 * Omnibox — docs/04 §3. Plain GET form to /search; the global "/" shortcut
 * focuses it from anywhere on the news site, Esc blurs.
 */

import { useEffect, useRef } from "react";

export default function SearchBox() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        ref.current?.focus();
      } else if (e.key === "Escape" && el === ref.current) {
        ref.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form action="/search" role="search" className="relative hidden sm:block">
      <input
        ref={ref}
        name="q"
        type="search"
        placeholder="Search news, tickers…"
        autoComplete="off"
        className="h-8 w-44 rounded-full border border-border bg-muted px-3 pr-8 text-xs outline-none transition-[width] focus:w-64 focus:border-ring lg:w-56"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1 font-mono text-[10px] text-muted-foreground">
        /
      </kbd>
    </form>
  );
}
