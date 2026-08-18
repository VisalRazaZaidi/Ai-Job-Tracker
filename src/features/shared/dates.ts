// Small date helpers shared by the Home command center (attention derivation)
// and Recent Activity. All comparisons use the caller's local time.

const DAY = 86_400_000;

export function fmtDate(v: Date | string) {
  return new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// A follow-up is "due" once its day has arrived or passed (needs attention now).
export function isDue(v: Date | string) {
  const d = new Date(v);
  d.setHours(23, 59, 59, 999);
  return d.getTime() <= Date.now();
}

// Not yet due, but lands within the next `days` (default 7) — worth surfacing.
export function isUpcoming(v: Date | string, days = 7) {
  const t = new Date(v).getTime();
  return t > Date.now() && t <= Date.now() + days * DAY;
}

// Applied within the trailing `days` window.
export function withinLast(v: Date | string, days = 7) {
  const t = new Date(v).getTime();
  return t <= Date.now() && t >= Date.now() - days * DAY;
}
