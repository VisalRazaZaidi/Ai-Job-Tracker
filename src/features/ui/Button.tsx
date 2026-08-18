"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";

// The app's two-button hierarchy. Primary = accent fill (the one dominant action
// per screen); secondary = bordered; ghost/danger for tertiary/row actions.
const VARIANTS = {
  primary:
    "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50",
  secondary:
    "rounded-md border border-line px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface disabled:opacity-50",
  danger:
    "rounded-md border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50",
  ghost:
    "rounded-md p-1.5 text-muted transition hover:bg-surface hover:text-fg disabled:opacity-50",
} as const;

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: {
  variant?: keyof typeof VARIANTS;
  size?: "md" | "sm" | "icon";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizeCls =
    size === "sm"
      ? "rounded-md px-3 py-1.5 text-sm"
      : size === "icon"
        ? "rounded-md p-1.5"
        : "";
  return (
    <button
      className={`${VARIANTS[variant]} ${sizeCls} inline-flex items-center gap-1.5 ${className}`}
      {...props}
    />
  );
}
