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
    <main className="relative min-h-screen overflow-hidden px-3 py-3 text-[color:var(--text-main)] sm:px-4 sm:py-4">
      <div
        aria-hidden="true"
        className="ambient-orb pointer-events-none absolute left-[-9rem] top-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,var(--accent-soft)_0%,transparent_68%)] opacity-55"
      />
      <div
        aria-hidden="true"
        className="ambient-orb pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_72%)] opacity-24"
      />

      <section className="surface-panel relative z-10 mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-[1440px] gap-4 overflow-hidden p-3 lg:grid-cols-[1.1fr_0.78fr] lg:p-4">
        <div className="auth-shell surface-card relative flex flex-col justify-between overflow-hidden p-5 sm:p-6 lg:p-7">
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[color:var(--accent-outline)] bg-[color:var(--accent-soft)] text-sm font-semibold text-[color:var(--text-main)]">
                NX
              </div>
              <div>
                <p className="eyebrow-label">Nexus</p>
                <p className="mt-1 text-sm text-[color:var(--text-subtle)]">
                  Single-pane homelab operations
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="status-badge">Overview to alerts</span>
              <span className="status-badge">Realtime shell</span>
              <span className="status-badge">Saved operator defaults</span>
            </div>

            <h1 className="mt-6 max-w-2xl text-[2.35rem] font-semibold tracking-[-0.07em] sm:text-[2.9rem] lg:text-[3.45rem]">
              One workspace for the systems you actually have to keep alive.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-subtle)]">
              Nexus keeps infrastructure, media, CI, and attention signals on one calm surface so daily checks do not turn into six open tabs and a memory test.
            </p>
          </div>

          <div className="mt-8 grid gap-2.5 lg:grid-cols-3">
            <article className="hero-stat">
              <p className="eyebrow-label">Live posture</p>
              <p className="mt-2.5 text-base font-semibold tracking-[-0.03em]">
                Realtime shell state
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                Notifications, provider syncs, and heartbeat freshness update without a full reload.
              </p>
            </article>
            <article className="hero-stat">
              <p className="eyebrow-label">Operator memory</p>
              <p className="mt-2.5 text-base font-semibold tracking-[-0.03em]">
                Preferences persist
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                Theme, density, layout posture, and landing defaults stay attached to the session.
              </p>
            </article>
            <article className="hero-stat">
              <p className="eyebrow-label">Surface coverage</p>
              <p className="mt-2.5 text-base font-semibold tracking-[-0.03em]">
                One shell, six domains
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-subtle)]">
                Overview, Home Lab, Media, DevOps, Metrics, and Alerts all share one navigation model.
              </p>
            </article>
          </div>
        </div>

        <div className="surface-card flex flex-col justify-between p-5 sm:p-6 lg:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow-label">Admin Access</p>
              <h2 className="mt-2.5 text-[1.9rem] font-semibold tracking-[-0.05em]">
                Enter the dashboard
              </h2>
              <p className="mt-2.5 max-w-md text-sm leading-6 text-[color:var(--text-subtle)]">
                Sign in with the single-admin credentials configured for the API runtime.
              </p>
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
            className="mt-6 space-y-3.5"
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
                className="rounded-[12px] border px-3.5 py-2.5 text-sm text-[color:var(--text-main)]"
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
              className="flex h-11 w-full items-center justify-center rounded-[10px] border border-[color:var(--accent-outline)] bg-[color:var(--accent-strong)] px-4 text-sm font-semibold text-[color:var(--accent-contrast)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-[12px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-3.5 py-3">
            <p className="eyebrow-label">Environment ownership</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-subtle)]">
              `ADMIN_USERNAME` and `ADMIN_PASSWORD` remain deployment-managed, which keeps the login flow aligned with the single-admin model defined for this phase.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
