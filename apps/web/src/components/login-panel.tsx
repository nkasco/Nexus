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
      <section className="surface-panel relative z-10 grid w-full max-w-6xl gap-5 overflow-hidden p-5 lg:grid-cols-[1.1fr_0.78fr] lg:p-6">
        <div className="surface-card flex flex-col justify-between p-7 sm:p-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] text-base font-semibold">
                N
              </div>
              <div>
                <p className="eyebrow-label">Nexus</p>
                <p className="mt-1 text-sm text-[color:var(--text-subtle)]">
                  Operator dashboard
                </p>
              </div>
            </div>

            <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
              Dark, calm, and ready to run the whole homelab.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[color:var(--text-subtle)]">
              Phase 1.5 reshapes the shell into a more grounded workspace with
              cleaner hierarchy, quieter controls, and a darker visual system
              that can scale into the real data-rich dashboard.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <article className="surface-muted p-4">
              <p className="eyebrow-label">Realtime</p>
              <p className="mt-3 text-sm font-medium">Live shell state</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                Health pulses and notifications update without a full refresh.
              </p>
            </article>
            <article className="surface-muted p-4">
              <p className="eyebrow-label">Preferences</p>
              <p className="mt-3 text-sm font-medium">Saved operator setup</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                Theme, layout density, and shell posture persist through the
                API.
              </p>
            </article>
            <article className="surface-muted p-4">
              <p className="eyebrow-label">Routes</p>
              <p className="mt-3 text-sm font-medium">Shared foundation</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                Overview, Home Lab, Media, DevOps, Metrics, and Alerts all land
                in one shell.
              </p>
            </article>
          </div>
        </div>

        <div className="surface-card p-7 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow-label">Admin Access</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
                Enter the dashboard
              </h2>
            </div>
            <span className="status-badge">
              <span
                className="status-dot"
                style={{
                  background: apiHealthy
                    ? 'var(--success-strong)'
                    : 'var(--danger-strong)',
                }}
              />
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
                className="shell-input"
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
                className="shell-input"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>

            {errorMessage ? (
              <p
                className="rounded-[16px] border px-4 py-3 text-sm text-[color:var(--text-main)]"
                style={{
                  background:
                    'color-mix(in srgb, var(--danger-strong) 12%, transparent)',
                  borderColor:
                    'color-mix(in srgb, var(--danger-strong) 32%, transparent)',
                }}
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              className="flex h-12 w-full items-center justify-center rounded-[16px] border border-[color:var(--accent-outline)] bg-[color:var(--accent-strong)] px-4 text-sm font-semibold text-[color:var(--accent-contrast)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-[16px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-4 py-4">
            <p className="eyebrow-label">Development Note</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-subtle)]">
              The default development credential pair is controlled through
              `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the API environment.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
