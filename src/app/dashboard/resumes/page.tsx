"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Resume } from "@prisma/client";
import { Download, FileText, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import {
  useResumes,
  useImportResume,
  useCreateResume,
  useUpdateResume,
  useDeleteResume,
} from "@/features/resumes/hooks";
import { buildResumeReview } from "@/features/resumes/review";
import { Button } from "@/features/ui/Button";

export default function ResumesPage() {
  const { data: resumes, isLoading, error } = useResumes();
  const importMut = useImportResume();
  const createMut = useCreateResume();
  const deleteMut = useDeleteResume();

  const [selectedId, setSelectedId] = useState<string>("");
  const selected = resumes?.find((r) => r.id === selectedId);

  // Auto-select the first resume once loaded / after import.
  useEffect(() => {
    if (!selectedId && resumes && resumes.length > 0) setSelectedId(resumes[0].id);
  }, [resumes, selectedId]);

  const fileInput = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-uploading the same file
    if (!file) return;
    importMut.mutate(file, { onSuccess: (r) => setSelectedId(r.id) });
  }

  function handleNewBlank() {
    createMut.mutate(
      { name: "Untitled resume", content: "# Your Name\n\nStart writing your resume in markdown…" },
      { onSuccess: (r) => setSelectedId(r.id) }
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-fg">Resumes</h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFile}
            className="hidden"
          />
          <Link
            href="/dashboard/resumes/tailor"
            className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-surface"
          >
            <Sparkles size={15} /> Tailor with AI
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInput.current?.click()}
            disabled={importMut.isPending}
          >
            <Upload size={15} /> {importMut.isPending ? "Extracting…" : "Upload"}
          </Button>
          <Button variant="primary" size="sm" onClick={handleNewBlank}>
            <Plus size={16} /> New
          </Button>
        </div>
      </div>

      {importMut.error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {importMut.error.message}
        </p>
      )}

      {isLoading && <p className="text-muted">Loading resumes…</p>}
      {error && <p className="text-red-400">Failed to load resumes.</p>}

      {resumes && resumes.length === 0 && (
        <div className="rounded-md border border-dashed border-line p-10 text-center text-muted">
          <FileText className="mx-auto mb-3 opacity-40" size={28} />
          Upload a PDF or DOCX, or start a blank markdown resume.
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <div className="grid gap-5 md:grid-cols-[240px_1fr]">
          <ul className="space-y-1">
            {resumes.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSelectedId(r.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                    r.id === selectedId ? "bg-surface text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{r.name}</span>
                  {r.parentId && (
                    <span className="ml-auto shrink-0 rounded-full border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                      tailored
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <Editor
              key={selected.id}
              resume={selected}
              onDelete={() => {
                deleteMut.mutate(selected.id);
                setSelectedId("");
              }}
            />
          ) : (
            <p className="text-muted">Select a resume to edit.</p>
          )}
        </div>
      )}
    </>
  );
}

// Editor is remounted per resume (key={id}), so local state seeds cleanly from props.
function Editor({ resume, onDelete }: { resume: Resume; onDelete: () => void }) {
  const [name, setName] = useState(resume.name);
  const [content, setContent] = useState(resume.content);
  const update = useUpdateResume(resume.id);

  const dirty = name !== resume.name || content !== resume.content;
  const review = buildResumeReview(content);

  function handleExport() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(name || "resume").replace(/\s+/g, "-").toLowerCase()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-fg focus:border-accent focus:outline-none"
        />
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download size={15} /> Export
        </Button>
        <Button
          variant="primary"
          onClick={() => update.mutate({ name, content })}
          disabled={!dirty || update.isPending}
        >
          {update.isPending ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Delete resume"
          className="hover:text-red-400"
        >
          <Trash2 size={15} />
        </Button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={22}
        spellCheck={false}
        className="w-full rounded-md border border-line bg-surface px-3 py-2.5 font-mono text-[13px] leading-relaxed text-fg focus:border-accent focus:outline-none"
      />

      <div className="rounded-md border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-fg">Resume review</h2>
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
            {review.wordCount} words
          </span>
        </div>

        <p className="mt-2 text-sm text-muted">{review.summary}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-line bg-raised p-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted">Headings</div>
            <div className="mt-1 text-xl font-semibold text-fg">{review.headingCount}</div>
          </div>
          <div className="rounded-md border border-line bg-raised p-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted">Detected skills</div>
            <div className="mt-1 text-xl font-semibold text-fg">{review.skills.length}</div>
          </div>
          <div className="rounded-md border border-line bg-raised p-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted">Missing sections</div>
            <div className="mt-1 text-xl font-semibold text-fg">{review.missingSections.length}</div>
          </div>
        </div>

        {review.issues.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-red-300">
            {review.issues.map((issue) => (
              <li key={issue} className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                {issue}
              </li>
            ))}
          </ul>
        )}

        {review.missingSections.length > 0 && (
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted">Missing sections</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {review.missingSections.map((section) => (
                <span
                  key={section}
                  className="rounded-full border border-line bg-surface px-2 py-1 text-xs text-muted"
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}

        {review.skills.length > 0 && (
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted">Detected skills</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {review.skills.slice(0, 12).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-xs text-accent"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {resume.sourceFile && (
        <p className="text-xs text-muted">Imported from {resume.sourceFile}</p>
      )}
    </div>
  );
}
