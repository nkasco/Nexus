const navigationItems = [
  'Overview',
  'Home Lab',
  'Media',
  'DevOps',
  'Metrics',
  'Alerts',
];

export function AppShell() {
  return (
    <main className="min-h-screen p-6 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl grid-cols-[260px_1fr] gap-6 rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-panel backdrop-blur">
        <aside className="rounded-[28px] border border-slate-200/80 bg-white/80 p-5">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Nexus
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Control Center</h1>
          </div>

          <nav aria-label="Primary">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item}>
                  <button
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    type="button"
                  >
                    <span>{item}</span>
                    <span className="text-xs text-slate-400">Phase 1+</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="flex flex-col rounded-[28px] border border-slate-200/80 bg-slate-950 p-6 text-white">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Phase 0 Foundation
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                Monorepo bootstrap complete
              </h2>
            </div>
            <div className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300">
              Ready for integrations
            </div>
          </header>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Frontend</p>
              <p className="mt-3 text-xl font-semibold">Next.js + Tailwind</p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Backend</p>
              <p className="mt-3 text-xl font-semibold">
                NestJS + Prisma + SQLite
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Realtime</p>
              <p className="mt-3 text-xl font-semibold">
                WebSocket-ready architecture
              </p>
            </article>
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-5">
            <p className="text-sm font-medium text-emerald-200">
              Next milestone
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
              Phase 1 will layer in auth, the full dashboard shell, theme state,
              real-time transport, and layout persistence on top of this
              scaffold.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
