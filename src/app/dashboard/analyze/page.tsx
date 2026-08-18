"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/features/ui/Button";
import { AnalysisResult } from "@/features/ai/AnalysisResult";
import { useAnalyzeJob, useAnalyses, useDeleteAnalysis } from "@/features/ai/hooks";
import { AI_MODELS, DEFAULT_MODEL, type AiModelId } from "@/lib/ai";

const NEW = "__new__";

export default function AnalyzePage() {
  const { data: analyses, isLoading } = useAnalyses();
  const del = useDeleteAnalysis();
  const { mutate, isPending, error, reset } = useAnalyzeJob();

  // "" until history loads; NEW = the compose form; otherwise a saved analysis id.
  const [selectedId, setSelectedId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState<AiModelId>(DEFAULT_MODEL);

  // Land on the most recent analysis, or the compose form if there's no history.
  useEffect(() => {
    if (selectedId || !analyses) return;
    setSelectedId(analyses.length > 0 ? analyses[0].id : NEW);
  }, [analyses, selectedId]);

  const selected = analyses?.find((a) => a.id === selectedId);

  function startNew() {
    reset();
    setDescription("");
    setSelectedId(NEW);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    mutate(
      { description, model },
      { onSuccess: (saved) => { setSelectedId(saved.id); setDescription(""); } }
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-fg">AI Job Analyzer</h1>
          <p className="mt-1 text-sm text-muted">
            Paste a job description to extract skills, tech stack, and ATS keywords.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={startNew}>
          <Plus size={16} /> New
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-[240px_1fr]">
        <ul className="space-y-1">
          {isLoading && <li className="px-3 py-2 text-sm text-muted">Loading…</li>}
          {analyses?.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => { reset(); setSelectedId(a.id); }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                  a.id === selectedId ? "bg-surface text-fg" : "text-muted hover:text-fg"
                }`}
              >
                <span className="truncate">{a.title}</span>
              </button>
            </li>
          ))}
        </ul>

        <div>
          {selectedId === NEW ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the full job description here…"
                rows={12}
                maxLength={15000}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <div className="flex items-center gap-3">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as AiModelId)}
                  className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none"
                >
                  {AI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.provider} — {m.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPending || description.trim().length < 50}
                >
                  {isPending ? "Analyzing…" : "Analyze"}
                </Button>
              </div>
              {error && (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error.message}
                </p>
              )}
            </form>
          ) : selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-medium text-fg">{selected.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { del.mutate(selected.id); setSelectedId(NEW); }}
                  aria-label="Delete analysis"
                  className="hover:text-red-400"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
              <AnalysisResult data={selected.result} />
            </div>
          ) : (
            <p className="text-muted">Select an analysis or start a new one.</p>
          )}
        </div>
      </div>
    </>
  );
}
