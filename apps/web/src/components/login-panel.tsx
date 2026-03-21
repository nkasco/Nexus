'use client';

import { useState } from 'react';

interface LoginPanelProps {
  isSubmitting: boolean;
  errorMessage?: string;
  apiHealthy: boolean;
  onSubmit: (credentials: { username: string; password: string }) => void;
}

export function LoginPanel({
  isSubmitting,
  errorMessage,
  apiHealthy,
  onSubmit,
}: LoginPanelProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 text-[color:var(--text-main)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.32),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(111,172,255,0.18),transparent_32%)]" />
      <section className="relative z-10 grid w-full max-w-5xl gap-6 rounded-[36px] border border-white/30 bg-[color:var(--shell-surface)] p-6 shadow-[0_30px_90px_rgba(9,17,31,0.22)] backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[30px] border border-white/16 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.06))] p-8">
          <p className="text-xs uppercase tracking-[0.38em] text-[color:var(--text-subtle)]">
            Nexus
          </p>
          <h1 className="mt-5 max-w-lg text-4xl font-semibold tracking-tight text-[color:var(--text-main)]">
            One control surface for the whole homelab.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--text-subtle)]">
            Phase 1 brings the authenticated shell online with saved layout
            presets, realtime transport, operator notifications, and a shared
            visual system for every dashboard route.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-[24px] border border-white/14 bg-white/8 p-4">
              <p className="text-sm font-medium">Realtime ready</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                Health pings and notification broadcasts land without a full
                refresh.
              </p>
            </article>
            <article className="rounded-[24px] border border-white/14 bg-white/8 p-4">
              <p className="text-sm font-medium">Saved preferences</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                Theme, layout density, and shell posture persist through the
                API.
              </p>
            </article>
            <article className="rounded-[24px] border border-white/14 bg-white/8 p-4">
              <p className="text-sm font-medium">Route foundation</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                Overview, Home Lab, Media, DevOps, Metrics, and Alerts all share
                the same core shell.
              </p>
            </article>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/16 bg-[color:var(--panel-strong)] p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-subtle)]">
                Admin Access
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Enter the dashboard
              </h2>
            </div>
            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
              {apiHealthy ? 'API healthy' : 'API unavailable'}
            </span>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit({ username, password });
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm text-[color:var(--text-subtle)]">
                Username
              </span>
              <input
                className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-base text-[color:var(--text-main)] outline-none transition focus:border-[color:var(--accent-strong)]"
                name="username"
                onChange={(event) => setUsername(event.target.value)}
                value={username}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-[color:var(--text-subtle)]">
                Password
              </span>
              <input
                className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-base text-[color:var(--text-main)] outline-none transition focus:border-[color:var(--accent-strong)]"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>

            {errorMessage ? (
              <p className="rounded-2xl border border-rose-300/25 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
                {errorMessage}
              </p>
            ) : null}

            <button
              className="w-full rounded-2xl bg-[linear-gradient(135deg,var(--accent-strong),var(--accent-soft))] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm leading-6 text-[color:var(--text-subtle)]">
            The default development credential pair is controlled through
            `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the API environment.
          </p>
        </div>
      </section>
    </main>
  );
}
