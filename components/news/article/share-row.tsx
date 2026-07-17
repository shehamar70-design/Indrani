"use client";

/**
 * Share row — docs/28 layout A: copy link, X, WhatsApp (India audience),
 * email. Intent URLs only; copy uses the clipboard API.
 */

import { useState } from "react";

export default function ShareRow({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://indrani.news${path}`; // canonical host; works pre-deploy as shareable text
  const enc = encodeURIComponent;

  const links = [
    { label: "X", href: `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    { label: "Email", href: `mailto:?subject=${enc(title)}&body=${enc(url)}` },
  ];

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="rounded border border-border px-2.5 py-1 font-semibold hover:border-foreground"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-border px-2.5 py-1 font-semibold hover:border-foreground"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
