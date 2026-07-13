"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { GoogleIcon } from "./GoogleIcon";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotNotice, setForgotNotice] = useState(false);

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  function handleForgotPassword() {
    // TODO: build a real reset-password page once the core flows are live.
    setForgotNotice(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-ink/15 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink/5 dark:border-white/20 dark:text-zinc-50 dark:hover:bg-white/10"
      >
        <GoogleIcon size={18} />
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
        <span className="text-xs font-medium text-mute dark:text-zinc-500">
          or
        </span>
        <div className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-ink dark:text-zinc-50"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-ink/15 bg-canvas px-4 py-3 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-ink dark:text-zinc-50"
            >
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-body hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-canvas px-4 py-3 pr-11 text-base text-ink outline-none focus:border-ink/40 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-mute hover:text-ink dark:text-zinc-500 dark:hover:text-zinc-50"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
        </div>

        {forgotNotice && (
          <p className="rounded-xl bg-brand-pale px-4 py-3 text-sm text-ink dark:bg-zinc-800 dark:text-zinc-200">
            Password reset isn&apos;t connected yet. Check back soon.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-3xl bg-brand py-3.5 text-base font-semibold text-ink transition-transform hover:bg-brand-hover active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
