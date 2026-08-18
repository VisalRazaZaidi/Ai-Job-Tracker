"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

// Accessible modal dialog. Handles everything the app's dialogs previously
// reimplemented by hand:
//   - traps keyboard focus inside while open
//   - restores focus to the trigger on close
//   - scroll-locks the page behind the backdrop
//   - Escape + backdrop-click to close
//   - aria-labelledby wired to the heading (via useId)
export function Dialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // 1. Remember who opened us, for focus restore.
    const trigger = document.activeElement as HTMLElement | null;

    // 2. Scroll-lock the page while open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 3. Move focus into the dialog (so Tab lands inside, not behind it).
    panelRef.current?.focus();

    // 4. Escape closes.
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-[dialog-in_120ms_ease-out] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-line bg-base p-6 shadow-hard outline-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          // Trap Tab inside the dialog: wrap from last → first and first → last.
          if (e.key !== "Tab") return;
          const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (!focusables || focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold text-fg">
            {title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
