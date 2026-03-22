import type {
  DashboardResponse,
  NotificationItem,
  UiPreferences,
} from '@nexus/shared';
import { render, screen } from '@testing-library/react';
import { AppShell } from './app-shell';

const preferences: UiPreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  compactMode: false,
  accent: 'graphite',
};

const dashboard: DashboardResponse = {
  slug: 'overview',
  name: 'Overview',
  updatedAt: '2026-03-21T12:00:00.000Z',
  layout: {
    preset: 'balanced',
    widgets: [
      {
        id: 'overview-health',
        title: 'Fleet Health',
        columnSpan: 2,
        rowSpan: 1,
      },
    ],
  },
};

const notifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Nexus ready',
    message: 'Shell online',
    severity: 'success',
    source: 'system',
    createdAt: '2026-03-21T12:00:00.000Z',
    read: false,
  },
];

describe('AppShell', () => {
  it('renders navigation, controls, and widget content', () => {
    const { container, getByTestId } = render(
      <AppShell
        dashboard={dashboard}
        health={{
          service: 'nexus-api',
          status: 'ok',
          timestamp: '2026-03-21T12:00:00.000Z',
          uptimeSeconds: 12,
          components: [],
        }}
        isNotificationCenterOpen
        isSaving={false}
        lastEventAt="2026-03-21T12:00:00.000Z"
        notifications={notifications}
        onWidgetFocusChange={() => {}}
        onWidgetRefresh={() => {}}
        onAccentChange={() => {}}
        onCompactToggle={() => {}}
        onLayoutPresetChange={() => {}}
        onMarkAllRead={() => {}}
        onNotificationToggle={() => {}}
        onSidebarToggle={() => {}}
        onSignOut={() => {}}
        onThemeChange={() => {}}
        preferences={preferences}
        refreshingWidgetIds={{}}
        section="overview"
        unreadCount={1}
        userName="Primary Operator"
        use24HourTime={false}
        websocketStatus="connected"
        widgets={[
          {
            id: 'overview-health',
            title: 'Attention Summary',
            eyebrow: 'Attention',
            detail: 'Operational signals sourced from the current snapshot.',
            metric: '1 signal',
            state: 'ready',
            focus: 'summary',
            items: [
              {
                label: 'Proxmox sync',
                value: '1 minute ago',
                detail: 'Cluster quorum healthy across both nodes.',
                tone: 'success',
              },
            ],
            stats: [
              {
                label: 'Healthy',
                value: '1',
                detail: 'Providers currently healthy',
                tone: 'success',
              },
            ],
            tone: 'success',
            updatedLabel: 'just now',
            refreshScope: 'all',
            navigationTarget: 'alerts',
            columnSpan: 2,
            rowSpan: 1,
          },
        ]}
      />,
    );

    expect(screen.getByText('Operator Shell')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Overview' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Workspace Controls')).toBeInTheDocument();
    expect(screen.getByText('Attention Summary')).toBeInTheDocument();
    expect(screen.getByText('1 unread item')).toBeInTheDocument();
    expect(screen.getByText('Proxmox sync')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      '/alerts',
    );
    expect(
      screen.getByRole('button', { name: 'Collapse sidebar' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Settings/ })).toHaveAttribute(
      'href',
      '/settings',
    );
    expect(getByTestId('app-sidebar')).toHaveClass(
      'lg:w-[292px]',
      'pl-0',
      'pr-0',
      'rounded-none',
      'border-l-0',
      'border-t-0',
      'border-b-0',
    );
    expect(getByTestId('nav-link-overview')).toHaveClass(
      'px-3',
      'rounded-[14px]',
    );
    expect(container.firstChild).toHaveClass('pl-0', 'pt-0');
  });
});
