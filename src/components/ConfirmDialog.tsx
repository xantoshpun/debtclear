"use client";

import { useState } from "react";
import { Warning } from "@phosphor-icons/react/dist/ssr";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 px-4 dark:bg-black/60">
      <div className="w-full max-w-sm rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-negative/10 text-negative">
            <Warning size={20} weight="bold" />
          </div>
          <h2 className="text-lg font-bold text-ink dark:text-zinc-50">{title}</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-body dark:text-zinc-400">
          {message}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-3xl px-5 py-2.5 text-sm font-semibold text-body hover:bg-ink/5 dark:text-zinc-400 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-3xl bg-negative px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
