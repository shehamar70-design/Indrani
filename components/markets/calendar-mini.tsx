/**
 * CalendarMini — docs/33 right rail. Today's top economic events (max 3,
 * FRED via docs/31 pipeline). Parent fetches; symbols render only what
 * resolved — empty day gets an honest empty state (docs/18 §2).
 */

import type { CalendarEvent } from "@/lib/data/types";
import { formatNumber } from "@/lib/format";

export default function CalendarMini({
  events,
  limit = 3,
}: {
  events: CalendarEvent[];
  limit?: number;
}) {
  const rows = events.slice(0, limit);

  return (
    <section aria-label="Economic calendar">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Today&apos;s calendar</h2>
      {rows.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">No releases scheduled today.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((e) => (
            <li key={e.id} className="py-2">
              <p className="text-sm font-semibold">{e.name}</p>
              <p className="text-xs text-muted-foreground">
                {e.region}
                {e.previous != null && (
                  <span className="ml-2 tabular-nums">
                    prev {formatNumber(e.previous)}
                    {e.unit ? ` ${e.unit}` : ""}
                  </span>
                )}
                {e.actual != null && (
                  <span className="ml-2 font-semibold tabular-nums text-foreground">
                    actual {formatNumber(e.actual)}
                    {e.unit ? ` ${e.unit}` : ""}
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
