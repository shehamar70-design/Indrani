/**
 * FRED provider — PRIMARY macro/economic data + release calendar. docs/12 §1.
 * Official free API, 120 req/min. Key server-side in FRED_API_KEY.
 */

import type { CalendarEvent } from "../types";

const BASE = "https://api.stlouisfed.org/fred";

function key(): string {
  const k = process.env.FRED_API_KEY;
  if (!k) throw new Error("FRED_API_KEY not set");
  return k;
}

export interface FredObservation {
  date: string;
  value: number | null;
}

export async function fredSeries(
  seriesId: string,
  limit = 100,
): Promise<FredObservation[]> {
  const url = `${BASE}/series/observations?series_id=${encodeURIComponent(
    seriesId,
  )}&api_key=${key()}&file_type=json&sort_order=desc&limit=${limit}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
  if (!res.ok) throw new Error(`fred ${res.status}`);
  const data = (await res.json()) as {
    observations: { date: string; value: string }[];
  };
  return data.observations.map((o) => ({
    date: o.date,
    value: o.value === "." ? null : parseFloat(o.value),
  }));
}

interface FredReleaseDate {
  release_id: number;
  release_name: string;
  date: string;
}

/** Upcoming/recent release calendar → normalized CalendarEvents (US region). */
export async function fredCalendar(
  from: string,
  to: string,
): Promise<CalendarEvent[]> {
  const url = `${BASE}/releases/dates?api_key=${key()}&file_type=json&realtime_start=${from}&realtime_end=${to}&include_release_dates_with_no_data=true&sort_order=asc&limit=1000`;
  const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
  if (!res.ok) throw new Error(`fred ${res.status}`);
  const data = (await res.json()) as { release_dates: FredReleaseDate[] };
  return data.release_dates
    .filter((r) => r.date >= from && r.date <= to)
    .map((r) => ({
      id: `fred-${r.release_id}-${r.date}`,
      name: r.release_name,
      date: r.date,
      region: "US",
    }));
}
