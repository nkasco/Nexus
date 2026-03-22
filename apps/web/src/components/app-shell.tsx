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
  refreshingWidgetIds: Record<string, boolean>;
  onSidebarToggle: () => void;
  onThemeChange: (theme: UiPreferences['theme']) => void;
  onAccentChange: (accent: UiPreferences['accent']) => void;
  onCompactToggle: () => void;
  onLayoutPresetChange: (preset: DashboardResponse['layout']['preset']) => void;
  onNotificationToggle: () => void;
  onMarkAllRead: () => void;
  onWidgetFocusChange: (widgetId: string, focus: WidgetView['focus']) => void;
  onWidgetRefresh: (widgetId: string) => void;
  onSignOut: () => void;
}

type GlyphName =
  | 'overview'
  | 'home-lab'
  | 'media'
  | 'devops'
  | 'metrics'
  | 'alerts'
  | 'notifications'
  | 'connectivity'
  | 'theme'
  | 'accent'
  | 'layout'
  | 'density'
  | 'pulse';

const glyphs: Record<GlyphName, string> = {
  overview:
    'M4 6.5A2.5 2.5 0 0 1 6.5 4h3A2.5 2.5 0 0 1 12 6.5v3A2.5 2.5 0 0 1 9.5 12h-3A2.5 2.5 0 0 1 4 9.5z M13 6.5A2.5 2.5 0 0 1 15.5 4h3A2.5 2.5 0 0 1 21 6.5v3A2.5 2.5 0 0 1 18.5 12h-3A2.5 2.5 0 0 1 13 9.5z M4 15.5A2.5 2.5 0 0 1 6.5 13h3A2.5 2.5 0 0 1 12 15.5v3A2.5 2.5 0 0 1 9.5 21h-3A2.5 2.5 0 0 1 4 18.5z M13 15.5A2.5 2.5 0 0 1 15.5 13h3a2.5 2.5 0 0 1 2.5 2.5v3a2.5 2.5 0 0 1-2.5 2.5h-3a2.5 2.5 0 0 1-2.5-2.5z',
  'home-lab':
    'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z',
  media:
    'M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M10 9.5v5l5-2.5z',
  devops: 'M8.5 7 5 10.5 8.5 14 M15.5 7 19 10.5 15.5 14 M13 5l-2 11',
  metrics: 'M5 18V9 M12 18V6 M19 18v-8 M4 20h16',
  alerts: 'M12 4 20 19H4z M12 9v4 M12 16h.01',
  notifications:
    'M12 4a5 5 0 0 1 5 5v2.8c0 .9.3 1.8.86 2.5l.84 1.1A1 1 0 0 1 17.9 17H6.1a1 1 0 0 1-.8-1.6l.84-1.1c.56-.72.86-1.6.86-2.5V9a5 5 0 0 1 5-5z M10 19a2 2 0 0 0 4 0',
  connectivity:
    'M5 18.5a11 11 0 0 1 14 0 M8 14.5a7 7 0 0 1 8 0 M11 10.5a3 3 0 0 1 2 0 M12 19.5h.01',
  theme:
    'M12 3v2.2 M12 18.8V21 M4.9 4.9l1.6 1.6 M17.5 17.5l1.6 1.6 M3 12h2.2 M18.8 12H21 M4.9 19.1l1.6-1.6 M17.5 6.5l1.6-1.6 M12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6z',
  accent: 'M12 4 4.5 8.2 12 20 19.5 8.2z',
  layout: 'M4.5 6.5h15 M4.5 12h15 M4.5 17.5h8.5',
  density: 'M5 8h14 M5 12h14 M5 16h14',
  pulse: 'M4 12h4l2-4 4 8 2-4h4',
};

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

function statusTone(
  health: HealthResponse | null,
  websocketStatus: AppShellProps['websocketStatus'],
) {
  if (health?.status === 'ok' && websocketStatus === 'connected') {
    return 'healthy';
  }

  if (websocketStatus === 'disconnected') {
    return 'offline';
  }

  return 'pending';
}

function widgetSpanClass(widget: WidgetView, compactMode: boolean) {
  if (compactMode) {
    return 'col-span-12 md:col-span-6 xl:col-span-4';
  }

  if (widget.columnSpan >= 2) {
    return 'col-span-12 xl:col-span-6';
  }

  return 'col-span-12 md:col-span-6 xl:col-span-3';
}

function lastEventLabel(lastEventAt: string | null) {
  if (!lastEventAt) {
    return 'Awaiting first pulse';
  }

  return new Date(lastEventAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ShellGlyph({
  className,
  name,
}: {
  name: GlyphName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d={glyphs[name]} />
    </svg>
  );
}

function ToolbarSelect<T extends string>({
  icon,
  label,
  onChange,
  options,
  value,
}: {
  icon: GlyphName;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="toolbar-control">
      <span className="flex items-center gap-2 text-[color:var(--text-subtle)]">
        <ShellGlyph className="h-4 w-4" name={icon} />
        <span className="eyebrow-label">{label}</span>
      </span>
      <select
        aria-label={label}
        className="toolbar-select"
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionNavIcon({ slug }: { slug: DashboardSlug }) {
  return <ShellGlyph className="h-4 w-4" name={slug} />;
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
  refreshingWidgetIds,
  onSidebarToggle,
  onThemeChange,
  onAccentChange,
  onCompactToggle,
  onLayoutPresetChange,
  onNotificationToggle,
  onMarkAllRead,
  onWidgetFocusChange,
  onWidgetRefresh,
  onSignOut,
}: AppShellProps) {
  const meta = getSectionMeta(section);
  const connectionTone = statusTone(health, websocketStatus);

  return (
    <main className="min-h-screen pb-4 pl-0 pr-4 pt-0 text-[color:var(--text-main)] sm:pr-6">
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        items={notifications}
        onMarkAllRead={onMarkAllRead}
        unreadCount={unreadCount}
      />

      <div className="grid min-h-screen max-w-none gap-4 lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside
          data-testid="app-sidebar"
          className={clsx(
            'surface-panel flex min-h-screen flex-col overflow-hidden rounded-none border-l-0 border-t-0 border-b-0 py-3 pl-0 pr-0 pt-0 transition-all duration-300',
            preferences.sidebarCollapsed ? 'lg:w-[96px]' : 'lg:w-[292px]',
          )}
          style={{ background: 'var(--shell-sidebar)' }}
        >
          <div className="flex items-center gap-3 border-b border-[color:var(--border-soft)] pb-4 pl-4 pr-2 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] text-sm font-semibold text-[color:var(--text-main)]">
              N
            </div>

            <div
              className={clsx(
                'min-w-0 flex-1 transition-opacity',
                preferences.sidebarCollapsed && 'lg:hidden',
              )}
            >
              <p className="eyebrow-label">Nexus</p>
              <h1 className="mt-1 text-[1.7rem] font-semibold tracking-[-0.03em]">
                Operator Shell
              </h1>
            </div>

            <button
              aria-label={
                preferences.sidebarCollapsed
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
              }
              className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] text-[color:var(--text-subtle)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--text-main)]"
              onClick={onSidebarToggle}
              type="button"
            >
              <span className="text-lg leading-none">
                {preferences.sidebarCollapsed ? '+' : '-'}
              </span>
            </button>
          </div>

          <nav aria-label="Primary" className="mt-3 flex-1 px-2">
            <ul className="space-y-1.5">
              {dashboardSections.map((item) => {
                const isActive = item.slug === section;

                return (
                  <li key={item.slug}>
                    <Link
                      data-testid={`nav-link-${item.slug}`}
                      className={clsx(
                        'group flex items-center gap-3 rounded-[14px] px-3 py-2.5 transition',
                        isActive
                          ? 'bg-[color:var(--accent-soft)] text-[color:var(--text-main)]'
                          : 'text-[color:var(--text-subtle)] hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--text-main)]',
                      )}
                      href={`/${item.slug}`}
                    >
                      <span
                        className={clsx(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border',
                          isActive
                            ? 'border-[color:var(--accent-outline)] bg-[color:var(--accent-soft)] text-[color:var(--text-main)]'
                            : 'border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] text-[color:var(--text-subtle)] group-hover:border-[color:var(--border-strong)] group-hover:text-[color:var(--text-main)]',
                        )}
                      >
                        <SectionNavIcon slug={item.slug} />
                      </span>

                      <span
                        className={clsx(
                          'min-w-0 transition-opacity',
                          preferences.sidebarCollapsed && 'lg:hidden',
                        )}
                      >
                        <span className="block truncate text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                          {item.eyebrow}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-5 border-t border-[color:var(--border-soft)] px-2 pb-1 pt-4">
            <div
              className={clsx(
                'surface-muted p-4',
                preferences.sidebarCollapsed && 'lg:px-2 lg:py-3',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    'status-dot',
                    connectionTone === 'healthy' &&
                      'bg-[color:var(--success-strong)]',
                    connectionTone === 'offline' &&
                      'bg-[color:var(--danger-strong)]',
                    connectionTone === 'pending' &&
                      'bg-[color:var(--warning-strong)]',
                  )}
                />
                <div
                  className={clsx(preferences.sidebarCollapsed && 'lg:hidden')}
                >
                  <p className="text-sm font-medium">Signed in as {userName}</p>
                  <p className="mt-1 text-xs leading-5 text-[color:var(--text-subtle)]">
                    {statusLabel(health, websocketStatus)}
                  </p>
                </div>
              </div>
            </div>

            <button
              className="mt-3 flex h-11 w-full items-center justify-center rounded-[12px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] text-sm font-medium text-[color:var(--text-subtle)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--text-main)]"
              onClick={onSignOut}
              type="button"
            >
              <span
                className={clsx(preferences.sidebarCollapsed && 'lg:hidden')}
              >
                Sign out
              </span>
              <span
                className={clsx(!preferences.sidebarCollapsed && 'lg:hidden')}
              >
                ↩
              </span>
            </button>
          </div>
        </aside>

        <section className="surface-panel flex min-h-[calc(100vh-2rem)] flex-col px-5 py-5 sm:px-6">
          <header className="border-b border-[color:var(--border-soft)] pb-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="status-badge">
                    <ShellGlyph className="h-3.5 w-3.5" name="pulse" />
                    {meta.eyebrow}
                  </span>
                  <span
                    className={clsx(
                      'status-badge',
                      connectionTone === 'healthy' &&
                        'text-[color:var(--success-strong)]',
                      connectionTone === 'offline' &&
                        'text-[color:var(--danger-strong)]',
                      connectionTone === 'pending' &&
                        'text-[color:var(--warning-strong)]',
                    )}
                  >
                    {statusLabel(health, websocketStatus)}
                  </span>
                </div>

                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-[3rem]">
                  {meta.label}
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[color:var(--text-subtle)]">
                  {meta.description}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 xl:w-[430px]">
                <button
                  className="toolbar-button"
                  onClick={onNotificationToggle}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-[color:var(--text-subtle)]">
                    <ShellGlyph className="h-4 w-4" name="notifications" />
                    <span className="eyebrow-label">Notifications</span>
                  </span>
                  <span className="mt-2 block text-sm font-medium text-[color:var(--text-main)]">
                    {unreadCount} unread item{unreadCount === 1 ? '' : 's'}
                  </span>
                </button>

                <div className="toolbar-control min-w-0">
                  <span className="flex items-center gap-2 text-[color:var(--text-subtle)]">
                    <ShellGlyph className="h-4 w-4" name="connectivity" />
                    <span className="eyebrow-label">Last event</span>
                  </span>
                  <span className="mt-2 block text-sm font-medium text-[color:var(--text-main)]">
                    {lastEventLabel(lastEventAt)}
                  </span>
                </div>

                <div className="toolbar-control min-w-0">
                  <span className="eyebrow-label">Session</span>
                  <span className="mt-2 block text-sm font-medium text-[color:var(--text-main)]">
                    {isSaving ? 'Saving changes...' : 'Saved'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="eyebrow-label">Workspace Controls</p>
                <p className="mt-1 text-sm text-[color:var(--text-subtle)]">
                  Keep the shell focused while layout and display settings stay
                  one click away.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <ToolbarSelect
                  icon="theme"
                  label="Theme"
                  onChange={onThemeChange}
                  options={[
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                    { value: 'light', label: 'Light' },
                  ]}
                  value={preferences.theme}
                />
                <ToolbarSelect
                  icon="accent"
                  label="Accent"
                  onChange={onAccentChange}
                  options={[
                    { value: 'graphite', label: 'Graphite' },
                    { value: 'aurora', label: 'Aurora' },
                  ]}
                  value={preferences.accent}
                />
                <ToolbarSelect
                  icon="layout"
                  label="Layout preset"
                  onChange={(value) =>
                    onLayoutPresetChange(
                      value as DashboardResponse['layout']['preset'],
                    )
                  }
                  options={[
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'compact', label: 'Compact' },
                  ]}
                  value={dashboard.layout.preset}
                />
                <button
                  className="toolbar-button min-w-[150px]"
                  onClick={onCompactToggle}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-[color:var(--text-subtle)]">
                    <ShellGlyph className="h-4 w-4" name="density" />
                    <span className="eyebrow-label">Density</span>
                  </span>
                  <span className="mt-2 block text-sm font-medium text-[color:var(--text-main)]">
                    {preferences.compactMode ? 'Compact' : 'Comfortable'}
                  </span>
                </button>
              </div>
            </div>
          </header>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow-label">Current Surface</p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                Dashboard
              </h3>
            </div>
            <p className="text-sm text-[color:var(--text-subtle)]">
              {dashboard.layout.preset === 'compact' ? 'Compact' : 'Balanced'}{' '}
              layout
            </p>
          </div>

          <div className="mt-5 grid grid-cols-12 gap-4">
            {widgets.map((widget) => (
              <WidgetFrame
                className={widgetSpanClass(widget, preferences.compactMode)}
                detail={widget.detail}
                eyebrow={widget.eyebrow}
                focus={widget.focus}
                isRefreshing={Boolean(refreshingWidgetIds[widget.id])}
                items={widget.items}
                key={widget.id}
                metric={widget.metric}
                navigationHref={
                  widget.navigationTarget
                    ? `/${widget.navigationTarget}`
                    : undefined
                }
                onFocusChange={(focus) => onWidgetFocusChange(widget.id, focus)}
                onRefresh={
                  widget.refreshScope
                    ? () => {
                        onWidgetRefresh(widget.id);
                      }
                    : undefined
                }
                state={widget.state}
                stats={widget.stats}
                title={widget.title}
                tone={widget.tone}
                updatedLabel={widget.updatedLabel}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
