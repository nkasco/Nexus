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
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0);
    expect(screen.getByText(/Workspace controls/i)).toBeInTheDocument();
    expect(screen.getByText('Dashboard field')).toBeInTheDocument();
    expect(screen.getByText('Attention Summary')).toBeInTheDocument();
    expect(screen.getByText('1 unread item')).toBeInTheDocument();
    expect(screen.getByText('Proxmox sync')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();

    const alertsLink = container.querySelector('a[href="/alerts"]');
    const collapseButton = container.querySelector(
      'button[aria-label="Collapse sidebar"]',
    );
    const settingsLink = container.querySelector('a[href="/settings"]');

    expect(alertsLink).not.toBeNull();
    expect(collapseButton).not.toBeNull();
    expect(settingsLink).not.toBeNull();
    expect(getByTestId('app-sidebar')).toHaveClass(
      'xl:w-[268px]',
      'workspace-sidebar',
      'surface-panel',
      'px-3',
      'py-3',
    );
    expect(getByTestId('nav-link-overview')).toHaveClass(
      'px-3',
      'rounded-[18px]',
      'border',
    );
    expect(container.firstChild).toHaveClass(
      'workspace-frame',
      'px-3',
      'py-3',
    );
  });
});
