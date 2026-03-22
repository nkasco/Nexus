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
  use24HourTime: boolean;
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
    return 'col-span-12 2xl:col-span-6';
  }

  return 'col-span-12 md:col-span-6 2xl:col-span-4';
}

function lastEventLabel(lastEventAt: string | null, use24HourTime: boolean) {
  if (!lastEventAt) {
    return 'Awaiting first pulse';
  }

  return new Date(lastEventAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24HourTime,
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
  className,
  icon,
  label,
  onChange,
  options,
  selectClassName,
  value,
}: {
  className?: string;
  icon: GlyphName;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  selectClassName?: string;
}) {
  return (
    <label className={clsx('toolbar-control', className)}>
      <span className="flex items-center gap-2 text-[color:var(--text-subtle)]">
        <ShellGlyph className="h-4 w-4" name={icon} />
        <span className="eyebrow-label">{label}</span>
      </span>
      <select
        aria-label={label}
        className={clsx('toolbar-select', selectClassName)}
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
  use24HourTime,
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
  const unreadLabel = `${unreadCount} unread item${unreadCount === 1 ? '' : 's'}`;
  const sessionLabel = isSaving ? 'Saving changes...' : 'Saved';
  const layoutPresetLabel =
    dashboard.layout.preset === 'compact' ? 'Compact' : 'Balanced';

  return (
    <main className="workspace-frame min-h-screen px-2 py-2 text-[color:var(--text-main)] sm:px-3 sm:py-3">
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        items={notifications}
        onMarkAllRead={onMarkAllRead}
        unreadCount={unreadCount}
      />

      <div className="grid min-h-[calc(100vh-1rem)] gap-2 xl:grid-cols-[224px_minmax(0,1fr)]">
        <section className="order-1 surface-panel flex min-h-[calc(100vh-1rem)] flex-col px-2.5 py-2.5 sm:px-3 sm:py-3 xl:order-2">
          <header className="workspace-hero rounded-[14px] border border-[color:var(--border-soft)] px-3 py-3 sm:px-4 sm:py-3.5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 max-w-3xl">
                <div className="flex flex-wrap items-center gap-1.5">
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
                  <span className="status-badge">
                    Last event {lastEventLabel(lastEventAt, use24HourTime)}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="eyebrow-label">Live operator workspace</p>
                  <div className="mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-[1.55rem] font-semibold tracking-[-0.05em] sm:text-[1.8rem]">
                        {meta.label}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm leading-5 text-[color:var(--text-subtle)]">
                        {meta.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:min-w-[360px]">
                <button
                  className="flex items-center justify-between gap-3 rounded-[12px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-3 py-2.5 text-left transition hover:border-[color:var(--border-strong)]"
                  onClick={onNotificationToggle}
                  type="button"
                >
                  <div className="flex items-center gap-2 text-[color:var(--text-subtle)]">
                    <ShellGlyph className="h-4 w-4" name="notifications" />
                    <span className="eyebrow-label">Notifications</span>
                  </div>
                  <p className="text-sm font-medium text-[color:var(--text-main)]">
                    {unreadLabel}
                  </p>
                </button>

                <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-3 py-2.5">
                  <span className="eyebrow-label">Session</span>
                  <p className="text-sm font-medium text-[color:var(--text-main)]">
                    {sessionLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 border-t border-[color:var(--border-soft)] pt-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow-label">Workspace controls</p>
                <p className="mt-1 text-xs leading-5 text-[color:var(--text-subtle)]">
                  Theme, density, and layout stay within reach while the widget
                  field starts sooner.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <ToolbarSelect
                  className="min-h-[56px] min-w-[118px] gap-2 px-2.5 py-2 sm:min-w-[126px]"
                  icon="theme"
                  label="Theme"
                  onChange={onThemeChange}
                  options={[
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                    { value: 'light', label: 'Light' },
                  ]}
                  selectClassName="mt-0.5 text-[13px]"
                  value={preferences.theme}
                />
                <ToolbarSelect
                  className="min-h-[56px] min-w-[118px] gap-2 px-2.5 py-2 sm:min-w-[126px]"
                  icon="accent"
                  label="Accent"
                  onChange={onAccentChange}
                  options={[
                    { value: 'graphite', label: 'Graphite' },
                    { value: 'aurora', label: 'Aurora' },
                  ]}
                  selectClassName="mt-0.5 text-[13px]"
                  value={preferences.accent}
                />
                <ToolbarSelect
                  className="min-h-[56px] min-w-[126px] gap-2 px-2.5 py-2"
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
                  selectClassName="mt-0.5 text-[13px]"
                  value={dashboard.layout.preset}
                />
                <button
                  className="toolbar-button min-h-[56px] min-w-[126px] gap-2 px-2.5 py-2"
                  onClick={onCompactToggle}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-[color:var(--text-subtle)]">
                    <ShellGlyph className="h-4 w-4" name="density" />
                    <span className="eyebrow-label">Density</span>
                  </span>
                  <span className="block text-sm font-medium text-[color:var(--text-main)]">
                    {preferences.compactMode ? 'Compact' : 'Comfortable'}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[color:var(--border-soft)] pt-3 text-xs leading-5 text-[color:var(--text-subtle)]">
              <span className="eyebrow-label">Dashboard field</span>
              <span>{layoutPresetLabel} layout</span>
              <span className="hidden h-1 w-1 rounded-full bg-[color:var(--border-strong)] sm:block" />
              <span className="min-w-0">
                The grid below prioritizes current state first, then the
                supporting detail needed to act.
              </span>
            </div>
          </header>

          <div className="mt-3 grid grid-cols-12 gap-2.5">
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

        <aside
          data-testid="app-sidebar"
          className={clsx(
            'order-2 workspace-sidebar surface-panel flex flex-col overflow-hidden px-2 py-2 transition-all duration-300 xl:order-1',
            preferences.sidebarCollapsed ? 'xl:w-[80px]' : 'xl:w-[224px]',
          )}
        >
          <div className="flex items-center gap-2 border-b border-[color:var(--border-soft)] px-1.5 pb-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[color:var(--accent-outline)] bg-[color:var(--accent-soft)] text-[13px] font-semibold text-[color:var(--text-main)]">
              N
            </div>

            <div
              className={clsx(
                'min-w-0 flex-1 transition-opacity',
                preferences.sidebarCollapsed && 'xl:hidden',
              )}
            >
              <p className="eyebrow-label">Nexus</p>
              <h1 className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.04em]">
                Operator Shell
              </h1>
            </div>

            <button
              aria-label={
                preferences.sidebarCollapsed
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
              }
              className="hidden h-8 w-8 items-center justify-center rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] text-[color:var(--text-subtle)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--text-main)] xl:flex"
              onClick={onSidebarToggle}
              type="button"
            >
              <span className="text-base leading-none">
                {preferences.sidebarCollapsed ? '+' : '-'}
              </span>
            </button>
          </div>

          <div
            className={clsx(
              'mt-2 flex items-center gap-2 rounded-[10px] border border-[color:var(--border-soft)] bg-[color:var(--panel-subtle)] px-2.5 py-2',
              preferences.sidebarCollapsed && 'xl:justify-center xl:px-0',
            )}
          >
            <div className="flex items-center gap-2">
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
              <p
                className={clsx(
                  'text-sm font-medium',
                  preferences.sidebarCollapsed && 'xl:hidden',
                )}
              >
                {userName}
              </p>
            </div>
            <div
              className={clsx(
                'min-w-0 flex-1',
                preferences.sidebarCollapsed && 'xl:hidden',
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                Session
              </p>
              <p className="mt-1 truncate text-[12px] leading-4 text-[color:var(--text-subtle)]">
                {statusLabel(health, websocketStatus)}
              </p>
            </div>
          </div>

          <nav aria-label="Primary" className="mt-2.5 flex-1 px-0.5">
            <div
              className={clsx(
                'mb-2 px-1.5',
                preferences.sidebarCollapsed && 'xl:hidden',
              )}
            >
              <p className="eyebrow-label">Workspace</p>
            </div>

            <ul className="flex gap-1.5 overflow-x-auto pb-1 xl:block xl:space-y-1 xl:overflow-visible xl:pb-0">
              {dashboardSections.map((item) => {
                const isActive = item.slug === section;

                return (
                  <li className="shrink-0 xl:shrink" key={item.slug}>
                    <Link
                      data-testid={`nav-link-${item.slug}`}
                      className={clsx(
                        'group flex min-w-[132px] items-center gap-2 rounded-[10px] border px-2 py-2 transition duration-150 xl:min-w-0',
                        isActive
                          ? 'border-[color:var(--accent-outline)] bg-[color:var(--accent-soft)] text-[color:var(--text-main)]'
                          : 'border-transparent text-[color:var(--text-subtle)] hover:border-[color:var(--border-soft)] hover:bg-[color:var(--panel-subtle)] hover:text-[color:var(--text-main)]',
                      )}
                      href={`/${item.slug}`}
                    >
                      <span
                        className={clsx(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border',
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
                          preferences.sidebarCollapsed && 'xl:hidden',
                        )}
                      >
                        <span className="block truncate text-[13px] font-medium leading-5">
                          {item.label}
                        </span>
                        <span className="mt-0.5 hidden truncate text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)] xl:block">
                          {item.eyebrow}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-2.5 border-t border-[color:var(--border-soft)] px-0.5 pt-2.5">
            <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
              <Link
                className="toolbar-button min-h-[52px] min-w-0 gap-1.5 px-2.5 py-2"
                href="/settings"
              >
                <span className="eyebrow-label">Operator tools</span>
                <span
                  className={clsx(
                    'block text-sm font-medium text-[color:var(--text-main)]',
                    preferences.sidebarCollapsed && 'xl:hidden',
                  )}
                >
                  Settings
                </span>
                <span
                  className={clsx(
                    'block text-sm font-medium text-[color:var(--text-main)] xl:hidden',
                    !preferences.sidebarCollapsed && 'hidden',
                  )}
                >
                  Gear
                </span>
              </Link>

              <button
                className="toolbar-button min-h-[52px] min-w-0 gap-1.5 px-2.5 py-2"
                onClick={onSignOut}
                type="button"
              >
                <span className="eyebrow-label">Session</span>
                <span
                  className={clsx(
                    'block text-sm font-medium text-[color:var(--text-main)]',
                    preferences.sidebarCollapsed && 'xl:hidden',
                  )}
                >
                  Sign out
                </span>
                <span
                  className={clsx(
                    'mt-2 block text-sm font-medium text-[color:var(--text-main)] xl:hidden',
                    !preferences.sidebarCollapsed && 'hidden',
                  )}
                >
                  Exit
                </span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
