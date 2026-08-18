import type { JobStatus } from "@prisma/client";

// The pipeline color language — the app's signature. Every status maps to one
// hue, grouped by pipeline stage, so the dashboard reads as a spectrum:
// dormant (slate) → applied (blue) → interviewing (amber) → won (green) → lost (red/dim).
const STATUS_HEX: Record<JobStatus, string> = {
  WISHLIST: "#64748b", // slate — not started
  APPLIED: "#3b82f6", // blue — in flight
  INTERVIEW: "#f59e0b", // amber — active conversation
  ASSESSMENT: "#f59e0b",
  TECHNICAL: "#f59e0b",
  HR: "#f59e0b",
  OFFER: "#22c55e", // green — won
  ACCEPTED: "#22c55e",
  REJECTED: "#ef4444", // red — lost
  WITHDRAWN: "#6b7280", // gray — closed by you
  ARCHIVED: "#4b5563", // dim — filed away
};

// One hue, three intensities: solid text/dot, 14% fill, 40% border.
// color-mix keeps the tint in sync with the hue without hand-tuning each alpha.
export function statusStyle(status: JobStatus) {
  const c = STATUS_HEX[status];
  return {
    color: c,
    backgroundColor: `color-mix(in srgb, ${c} 14%, transparent)`,
    borderColor: `color-mix(in srgb, ${c} 40%, transparent)`,
  };
}

export function statusHex(status: JobStatus) {
  return STATUS_HEX[status];
}

// The five lifecycle stages shown on Home's pipeline, each grouping the raw
// statuses that belong to it. Single source of truth for pipeline counts (Home)
// and stage filtering (Applications), so the count you see and the list you land
// on always agree. WITHDRAWN/ARCHIVED are closed states, intentionally not stages.
export const PIPELINE_STAGES = [
  { key: "wishlist", label: "Wishlist", statuses: ["WISHLIST"] },
  { key: "applied", label: "Applied", statuses: ["APPLIED"] },
  { key: "interview", label: "Interview", statuses: ["INTERVIEW", "ASSESSMENT", "TECHNICAL", "HR"] },
  { key: "offer", label: "Offer", statuses: ["OFFER", "ACCEPTED"] },
  { key: "rejected", label: "Rejected", statuses: ["REJECTED"] },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  statuses: readonly JobStatus[];
}>;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];
export type PipelineStageKey = PipelineStage["key"];

export function stageByKey(key: string | null | undefined): PipelineStage | undefined {
  return PIPELINE_STAGES.find((s) => s.key === key);
}

// Each stage's color is the hue of its leading status (the pipeline signature).
export function stageHex(stage: PipelineStage) {
  return STATUS_HEX[stage.statuses[0]];
}
