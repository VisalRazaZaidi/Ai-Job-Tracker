"use client";

import { CheckCircle, Circle, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { MatchResult } from "./matcher";

interface MatchScoreProps {
  result: MatchResult;
}

export function MatchScore({ result }: MatchScoreProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Determine score color/styling
  let scoreColor = "text-muted"; // No data
  if (result.score !== null) {
    if (result.score >= 75) scoreColor = "text-green-500";
    else if (result.score >= 50) scoreColor = "text-yellow-500";
    else scoreColor = "text-red-500";
  }

  return (
    <div className="rounded-md border border-line bg-surface p-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">
            Match Score
          </h3>
          <div className={`mt-2 text-4xl font-bold ${scoreColor}`}>
            {result.score !== null ? `${result.score}%` : "—"}
          </div>
          {result.score !== null && (
            <p className="mt-1 text-xs text-muted">
              {result.strong.length} strong · {result.partial.length} partial · {result.missing.length} gaps
            </p>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-raised px-3 py-2 text-sm text-fg transition hover:bg-surface"
        >
          {showDetails ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {showDetails ? "Hide" : "Show"} Details
        </button>
      </div>

      {showDetails && (
        <div className="mt-6 space-y-6 border-t border-line pt-6">
          {/* Strong Matches */}
          {result.strong.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">
                <CheckCircle size={14} className="text-green-500" />
                Strong Matches ({result.strong.length})
              </h4>
              <ul className="mt-3 space-y-1.5">
                {result.strong.map((skill) => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-fg">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Partial Matches */}
          {result.partial.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">
                <Circle size={14} className="border border-yellow-500" />
                Partial Matches ({result.partial.length})
              </h4>
              <ul className="mt-3 space-y-1.5">
                {result.partial.map((skill) => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full border border-yellow-500 bg-yellow-500/20" />
                    <span className="text-fg">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing/Gaps */}
          {result.missing.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">
                <XCircle size={14} className="text-red-500" />
                Skill Gaps ({result.missing.length})
              </h4>
              <p className="mt-2 text-xs text-muted">
                These skills are not detected in your resume. This doesn't mean you can't learn them — it just means they're not mentioned in your current resume.
              </p>
              <ul className="mt-3 space-y-1.5">
                {result.missing.map((skill) => (
                  <li key={skill} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-fg">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
