"use client";

import { useState } from "react";
import { Check, X, PencilSimple, Plus, Trash, Fire, Lightning } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CURRENCIES } from "@/lib/currency";
import type { PayoffStrategy } from "@/lib/payoff";

type Profile = { id: string; name: string };

const inputClass =
  "rounded-xl border border-ink/15 bg-canvas px-4 py-2.5 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40";

export function SettingsView({
  initialProfiles,
  initialStrategy,
  initialCurrency,
}: {
  initialProfiles: Profile[];
  initialStrategy: PayoffStrategy;
  initialCurrency: string;
}) {
  const supabase = createClient();

  const [profiles, setProfiles] = useState(initialProfiles);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Profile | null>(null);

  const [strategy, setStrategy] = useState<PayoffStrategy>(initialStrategy);
  const [currency, setCurrency] = useState(initialCurrency);
  const [error, setError] = useState<string | null>(null);

  async function saveSettings(patch: { default_strategy?: PayoffStrategy; currency?: string }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("settings")
      .upsert({ account_id: user.id, ...patch }, { onConflict: "account_id" });
    if (error) setError(error.message);
  }

  async function handleStrategyChange(next: PayoffStrategy) {
    setStrategy(next);
    await saveSettings({ default_strategy: next });
  }

  async function handleCurrencyChange(next: string) {
    setCurrency(next);
    await saveSettings({ currency: next });
  }

  function startEdit(profile: Profile) {
    setEditingId(profile.id);
    setEditName(profile.name);
  }

  async function saveEdit(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) return;
    const { data, error } = await supabase
      .from("profiles")
      .update({ name: trimmed })
      .eq("id", id)
      .select("id, name")
      .single();
    if (error || !data) {
      setError(error?.message ?? "Couldn't rename that profile.");
      return;
    }
    setProfiles((cur) => cur.map((p) => (p.id === id ? data : p)));
    setEditingId(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("profiles")
      .insert({ account_id: user!.id, name: trimmed })
      .select("id, name")
      .single();
    if (error || !data) {
      setError(error?.message ?? "Couldn't add that profile.");
      return;
    }
    setProfiles((cur) => [...cur, data]);
    setNewName("");
    setAdding(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("profiles").delete().eq("id", pendingDelete.id);
    if (error) {
      setError(error.message);
      setPendingDelete(null);
      return;
    }
    setProfiles((cur) => cur.filter((p) => p.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight text-ink dark:text-zinc-50">Settings</h1>
      <p className="mt-1 text-body dark:text-zinc-400">
        Manage who you&apos;re tracking with and how DebtClear behaves
      </p>

      {error && <p className="mt-4 text-sm text-negative">{error}</p>}

      <div className="mt-8 rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">
          Profiles
        </h2>
        <p className="mt-1 text-sm text-body dark:text-zinc-400">
          Everyone you track debts, income, and expenses for.
        </p>

        <ul className="mt-4 flex flex-col gap-2">
          {profiles.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-canvas-soft px-4 py-3 dark:bg-zinc-800"
            >
              {editingId === p.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEdit(p.id);
                  }}
                  className="flex flex-1 items-center gap-2"
                >
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`flex-1 ${inputClass} py-1.5`}
                  />
                  <button
                    type="submit"
                    aria-label="Save"
                    className="grid size-9 place-items-center rounded-full text-positive-deep hover:bg-positive/10 dark:text-emerald-400"
                  >
                    <Check size={18} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel"
                    className="grid size-9 place-items-center rounded-full text-mute hover:bg-ink/5 dark:text-zinc-400 dark:hover:bg-white/10"
                  >
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <>
                  <span className="font-semibold text-ink dark:text-zinc-50">{p.name}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      aria-label="Rename"
                      className="grid size-9 place-items-center rounded-full text-mute hover:bg-ink/5 hover:text-ink dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50"
                    >
                      <PencilSimple size={16} />
                    </button>
                    {profiles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPendingDelete(p)}
                        aria-label="Remove"
                        className="grid size-9 place-items-center rounded-full text-mute hover:bg-negative/10 hover:text-negative dark:text-zinc-400"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {adding ? (
          <form onSubmit={handleAdd} className="mt-3 flex items-center gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Their name"
              className={`flex-1 ${inputClass}`}
            />
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-ink"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setNewName("");
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-body hover:bg-ink/5 dark:text-zinc-400 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-semibold text-body hover:bg-ink/5 dark:border-white/20 dark:text-zinc-400 dark:hover:bg-white/10"
          >
            <Plus size={16} weight="bold" />
            Add a profile
          </button>
        )}
      </div>

      <div className="mt-6 rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">
          Default Payoff Strategy
        </h2>
        <p className="mt-1 text-sm text-body dark:text-zinc-400">
          Used to pre-select your strategy on the Payoff Plan and Simulator.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleStrategyChange("avalanche")}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${
              strategy === "avalanche"
                ? "border-brand bg-brand-pale dark:bg-zinc-800"
                : "border-ink/15 dark:border-white/20"
            }`}
          >
            <Fire size={20} weight="bold" className="mt-0.5 text-ink-deep dark:text-brand" />
            <div>
              <p className="font-bold text-ink dark:text-zinc-50">Avalanche</p>
              <p className="mt-0.5 text-sm text-body dark:text-zinc-400">
                Pay highest interest rate first. Minimizes total interest paid.
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleStrategyChange("snowball")}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${
              strategy === "snowball"
                ? "border-brand bg-brand-pale dark:bg-zinc-800"
                : "border-ink/15 dark:border-white/20"
            }`}
          >
            <Lightning size={20} weight="bold" className="mt-0.5 text-ink-deep dark:text-brand" />
            <div>
              <p className="font-bold text-ink dark:text-zinc-50">Snowball</p>
              <p className="mt-0.5 text-sm text-body dark:text-zinc-400">
                Pay smallest balance first. Builds momentum with quick wins.
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-canvas p-6 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-mute dark:text-zinc-400">Currency</h2>
        <p className="mt-1 text-sm text-body dark:text-zinc-400">
          Used everywhere DebtClear shows a dollar amount.
        </p>
        <select
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className={`mt-4 w-full max-w-xs ${inputClass}`}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Remove profile"
          message={`Remove "${pendingDelete.name}"? Their income will be deleted. Their debts and expenses will switch to Joint instead of being deleted. This can't be undone.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
