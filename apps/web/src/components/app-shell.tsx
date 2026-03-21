'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type {
  DashboardResponse,
  DashboardSlug,
  HealthResponse,
  NotificationItem,
  UiPreferences,
} from '@nexus/shared';
import {
  dashboardSections,
  getSectionMeta,
  type WidgetView,
} from '../lib/dashboard-sections';
import { NotificationCenter } from './notification-center';
import { WidgetFrame } from './widget-frame';

interface AppShellProps {
  section: DashboardSlug;
  userName: string;
  preferences: UiPreferences;
  dashboard: DashboardResponse;
  widgets: WidgetView[];
  notifications: NotificationItem[];
  unreadCount: number;
  isNotificationCenterOpen: boolean;
  websocketStatus: 'connecting' | 'connected' | 'disconnected';
  health: HealthResponse | null;
  lastEventAt: string | null;
  isSaving: boolean;
  onSidebarToggle: () => void;
  onThemeChange: (theme: UiPreferences['theme']) => void;
  onAccentChange: (accent: UiPreferences['accent']) => void;
  onCompactToggle: () => void;
  onLayoutPresetChange: (preset: DashboardResponse['layout']['preset']) => void;
  onNotificationToggle: () => void;
  onMarkAllRead: () => void;
  onSignOut: () => void;
}

function statusLabel(
  health: HealthResponse | null,
  websocketStatus: AppShellProps['websocketStatus'],
) {
  const apiStatus = health?.status === 'ok' ? 'API healthy' : 'API checking';
  const socketStatus =
    websocketStatus === 'connected'
      ? 'WebSocket live'
      : websocketStatus === 'connecting'
        ? 'WebSocket connecting'
        : 'WebSocket offline';

  return `${apiStatus} • ${socketStatus}`;
}

export function AppShell({
  section,
  userName,
  preferences,
  dashboard,
  widgets,
  notifications,
  unreadCount,
  isNotificationCenterOpen,
  websocketStatus,
  health,
  lastEventAt,
  isSaving,
  onSidebarToggle,
  onThemeChange,
  onAccentChange,
  onCompactToggle,
  onLayoutPresetChange,
  onNotificationToggle,
  onMarkAllRead,
  onSignOut,
}: AppShellProps) {
  const meta = getSectionMeta(section);

  return (
    <main className="min-h-screen px-4 py-4 text-[color:var(--text-main)] sm:px-6">
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        items={notifications}
        onMarkAllRead={onMarkAllRead}
        unreadCount={unreadCount}
      />

      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[auto_1fr]">
        <aside
          className={clsx(
            'flex flex-col rounded-[32px] border border-white/16 bg-[color:var(--shell-surface)] p-4 shadow-[0_24px_80px_rgba(8,15,30,0.18)] backdrop-blur-xl transition-all duration-300',
            preferences.sidebarCollapsed
              ? 'w-full lg:w-[104px]'
              : 'w-full lg:w-[298px]',
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/12 px-2 pb-4">
            <div
              className={clsx(
                'transition-opacity',
                preferences.sidebarCollapsed && 'lg:opacity-0',
              )}
            >
              <p className="text-xs uppercase tracking-[0.36em] text-[color:var(--text-subtle)]">
                Nexus
              </p>
              <h1 className="mt-2 text-2xl font-semibold">Operator Shell</h1>
            </div>
            <button
              className="rounded-full border border-white/12 bg-white/8 p-3 text-xs font-medium text-[color:var(--text-subtle)] transition hover:border-white/24 hover:text-[color:var(--text-main)]"
              onClick={onSidebarToggle}
              type="button"
            >
              {preferences.sidebarCollapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>

          <nav aria-label="Primary" className="mt-5 flex-1">
            <ul className="space-y-2">
              {dashboardSections.map((item) => {
                const isActive = item.slug === section;

                return (
                  <li key={item.slug}>
                    <Link
                      className={clsx(
                        'group flex items-center gap-3 rounded-[22px] border px-4 py-3 transition',
                        isActive
                          ? 'border-[color:var(--accent-soft)]/35 bg-[color:var(--accent-soft)]/18 text-[color:var(--text-main)]'
                          : 'border-transparent bg-transparent text-[color:var(--text-subtle)] hover:border-white/12 hover:bg-white/6 hover:text-[color:var(--text-main)]',
                      )}
                      href={`/${item.slug}`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-xs font-semibold uppercase tracking-[0.2em]">
                        {item.label.slice(0, 2)}
                      </span>
                      <span
                        className={clsx(
                          preferences.sidebarCollapsed && 'lg:hidden',
                        )}
                      >
                        <span className="block text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                          {item.eyebrow}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="rounded-[24px] border border-white/12 bg-white/6 p-4">
            <p
              className={clsx(
                'text-sm font-medium',
                preferences.sidebarCollapsed && 'lg:hidden',
              )}
            >
              Signed in as {userName}
            </p>
            <p
              className={clsx(
                'mt-2 text-sm leading-6 text-[color:var(--text-subtle)]',
                preferences.sidebarCollapsed && 'lg:hidden',
              )}
            >
              {statusLabel(health, websocketStatus)}
            </p>
            <button
              className="mt-4 w-full rounded-2xl border border-white/12 px-4 py-3 text-sm font-medium text-[color:var(--text-main)] transition hover:border-white/24 hover:bg-white/8"
              onClick={onSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        </aside>

        <section className="rounded-[32px] border border-white/16 bg-[color:var(--shell-surface)] p-4 shadow-[0_24px_80px_rgba(8,15,30,0.18)] backdrop-blur-xl sm:p-5">
          <header className="rounded-[28px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.15),rgba(255,255,255,0.04))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.36em] text-[color:var(--text-subtle)]">
                  {meta.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  {meta.label}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--text-subtle)]">
                  {meta.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
                <button
                  className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-left text-sm transition hover:border-white/24 hover:bg-white/12"
                  onClick={onNotificationToggle}
                  type="button"
                >
                  <span className="block text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                    Notifications
                  </span>
                  <span className="mt-2 block font-medium">
                    {unreadCount} unread item{unreadCount === 1 ? '' : 's'}
                  </span>
                </button>
                <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3">
                  <span className="block text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                    Connectivity
                  </span>
                  <span className="mt-2 block font-medium">
                    {statusLabel(health, websocketStatus)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[repeat(5,minmax(0,1fr))]">
              <label className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-sm">
                <span className="block text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                  Theme
                </span>
                <select
                  className="mt-2 w-full bg-transparent text-[color:var(--text-main)] outline-none"
                  onChange={(event) =>
                    onThemeChange(event.target.value as UiPreferences['theme'])
                  }
                  value={preferences.theme}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>

              <label className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-sm">
                <span className="block text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                  Accent
                </span>
                <select
                  className="mt-2 w-full bg-transparent text-[color:var(--text-main)] outline-none"
                  onChange={(event) =>
                    onAccentChange(
                      event.target.value as UiPreferences['accent'],
                    )
                  }
                  value={preferences.accent}
                >
                  <option value="aurora">Aurora</option>
                  <option value="graphite">Graphite</option>
                </select>
              </label>

              <label className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-sm">
                <span className="block text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                  Layout preset
                </span>
                <select
                  className="mt-2 w-full bg-transparent text-[color:var(--text-main)] outline-none"
                  onChange={(event) =>
                    onLayoutPresetChange(
                      event.target
                        .value as DashboardResponse['layout']['preset'],
                    )
                  }
                  value={dashboard.layout.preset}
                >
                  <option value="balanced">Balanced</option>
                  <option value="compact">Compact</option>
                </select>
              </label>

              <button
                className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-left text-sm transition hover:border-white/24 hover:bg-white/12"
                onClick={onCompactToggle}
                type="button"
              >
                <span className="block text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                  Density
                </span>
                <span className="mt-2 block font-medium">
                  {preferences.compactMode ? 'Compact' : 'Comfortable'}
                </span>
              </button>

              <div className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-sm">
                <span className="block text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                  Last event
                </span>
                <span className="mt-2 block font-medium">
                  {lastEventAt
                    ? new Date(lastEventAt).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Awaiting first pulse'}
                </span>
                <span className="mt-2 block text-xs uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                  {isSaving ? 'Saving changes...' : 'Saved'}
                </span>
              </div>
            </div>
          </header>

          <div
            className={clsx(
              'mt-5 grid gap-4',
              preferences.compactMode ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
            )}
          >
            {widgets.map((widget) => (
              <WidgetFrame
                className={clsx(
                  widget.columnSpan >= 2 &&
                    !preferences.compactMode &&
                    'lg:col-span-2',
                )}
                detail={widget.detail}
                eyebrow={widget.eyebrow}
                key={widget.id}
                metric={widget.metric}
                state={widget.state}
                title={widget.title}
              >
                {widget.lines?.map((line) => (
                  <p
                    className="text-sm leading-6 text-[color:var(--text-main)]"
                    key={line}
                  >
                    {line}
                  </p>
                ))}
              </WidgetFrame>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
