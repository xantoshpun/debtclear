"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash, Check, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; name: string };

export function OnboardingForm({
  existingProfiles,
}: {
  existingProfiles: Profile[];
}) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState(existingProfiles);

  if (profiles.length > 0) {
    return <SetUpSummary profiles={profiles} onAdd={(p) => setProfiles((cur) => [...cur, p])} />;
  }

  return <SetupWizard onDone={(created) => setProfiles(created)} supabase={supabase} />;
}

function SetUpSummary({
  profiles,
  onAdd,
}: {
  profiles: Profile[];
  onAdd: (p: Profile) => void;
}) {
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("profiles")
      .insert({ account_id: user!.id, name: name.trim() })
      .select("id, name")
      .single();
    setLoading(false);
    if (error || !data) {
      setError(error?.message ?? "Couldn't add that profile.");
      return;
    }
    onAdd(data);
    setName("");
    setAdding(false);
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-positive dark:text-emerald-400">
        <Check size={20} weight="bold" />
        <span className="text-sm font-semibold">You&apos;re set up</span>
      </div>
      <h1 className="mt-3 text-2xl font-black tracking-tight text-ink dark:text-zinc-50">
        Tracking for {profiles.length} {profiles.length === 1 ? "person" : "people"}
      </h1>
      <p className="mt-2 text-sm text-body dark:text-zinc-400">
        Debts, income, and expense tracking are coming next.
      </p>

      <Link
        href="/dashboard"
        className="mt-5 flex items-center justify-center gap-2 rounded-3xl bg-brand py-3.5 text-base font-semibold text-ink transition-transform hover:bg-brand-hover active:scale-[0.98]"
      >
        Continue to dashboard
        <ArrowRight size={18} weight="bold" />
      </Link>

      <ul className="mt-6 flex flex-col gap-2">
        {profiles.map((p) => (
          <li
            key={p.id}
            className="rounded-xl bg-canvas-soft px-4 py-3 text-sm font-semibold text-ink dark:bg-zinc-800 dark:text-zinc-50"
          >
            {p.name}
          </li>
        ))}
      </ul>

      {adding ? (
        <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name"
            className="rounded-xl border border-ink/15 bg-canvas px-4 py-3 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40"
          />
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-3xl bg-brand px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-3xl px-5 py-2.5 text-sm font-semibold text-body hover:bg-ink/5 dark:text-zinc-400 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-semibold text-body hover:bg-ink/5 dark:border-white/20 dark:text-zinc-400 dark:hover:bg-white/10"
        >
          <Plus size={16} weight="bold" />
          Add a profile
        </button>
      )}
    </div>
  );
}

function SetupWizard({
  onDone,
  supabase,
}: {
  onDone: (profiles: Profile[]) => void;
  supabase: ReturnType<typeof createClient>;
}) {
  const [name, setName] = useState("");
  const [trackingWithOthers, setTrackingWithOthers] = useState<boolean | null>(null);
  const [others, setOthers] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateOther(index: number, value: string) {
    setOthers((cur) => cur.map((o, i) => (i === index ? value : o)));
  }

  function removeOther(index: number) {
    setOthers((cur) => cur.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter your name to continue.");
      return;
    }
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const names = [
      name.trim(),
      ...(trackingWithOthers ? others.map((o) => o.trim()).filter(Boolean) : []),
    ];

    const { data, error } = await supabase
      .from("profiles")
      .insert(names.map((n) => ({ account_id: user!.id, name: n })))
      .select("id, name");

    setLoading(false);
    if (error || !data) {
      setError(error?.message ?? "Something went wrong, try again.");
      return;
    }
    onDone(data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-ink dark:text-zinc-50">
          Let&apos;s set things up
        </h1>
        <p className="mt-2 text-sm text-body dark:text-zinc-400">
          A couple of quick questions before you add your first debt.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-semibold text-ink dark:text-zinc-50">
          Your name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-ink/15 bg-canvas px-4 py-3 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink dark:text-zinc-50">
          Who are you tracking?
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTrackingWithOthers(false)}
            className={`rounded-xl border py-3 text-sm font-semibold ${
              trackingWithOthers === false
                ? "border-brand bg-brand-pale text-ink"
                : "border-ink/15 text-body hover:bg-ink/5 dark:border-white/20 dark:text-zinc-400 dark:hover:bg-white/10"
            }`}
          >
            Just me
          </button>
          <button
            type="button"
            onClick={() => setTrackingWithOthers(true)}
            className={`rounded-xl border py-3 text-sm font-semibold ${
              trackingWithOthers === true
                ? "border-brand bg-brand-pale text-ink"
                : "border-ink/15 text-body hover:bg-ink/5 dark:border-white/20 dark:text-zinc-400 dark:hover:bg-white/10"
            }`}
          >
            With others
          </button>
        </div>
      </div>

      {trackingWithOthers && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-ink dark:text-zinc-50">
            Who else?
          </span>
          {others.map((other, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={other}
                onChange={(e) => updateOther(i, e.target.value)}
                placeholder="Their name"
                className="flex-1 rounded-xl border border-ink/15 bg-canvas px-4 py-3 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40"
              />
              {others.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOther(i)}
                  aria-label="Remove"
                  className="grid size-11 shrink-0 place-items-center rounded-xl text-mute hover:bg-ink/5 hover:text-negative dark:text-zinc-500 dark:hover:bg-white/10"
                >
                  <Trash size={18} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOthers((cur) => [...cur, ""])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-2.5 text-sm font-semibold text-body hover:bg-ink/5 dark:border-white/20 dark:text-zinc-400 dark:hover:bg-white/10"
          >
            <Plus size={16} weight="bold" />
            Add another
          </button>
        </div>
      )}

      {error && <p className="text-sm text-negative">{error}</p>}

      <button
        type="submit"
        disabled={loading || trackingWithOthers === null}
        className="rounded-3xl bg-brand py-3.5 text-base font-semibold text-ink transition-transform hover:bg-brand-hover active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Setting up..." : "Continue"}
      </button>
    </form>
  );
}
