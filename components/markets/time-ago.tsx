"use client";

/**
 * Mount-gated relative time — docs/44 §1.1. `timeAgo` depends on Date.now(),
 * so rendering it during SSR diverges from the client render and trips the
 * same hydration failure as the chart tick labels. Render a dash until
 * mounted; server and client markup stay identical.
 */

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

export default function TimeAgo({ iso }: { iso: string | null | undefined }) {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    setLabel(timeAgo(iso));
  }, [iso]);
  return <span>{label ?? "—"}</span>;
}
