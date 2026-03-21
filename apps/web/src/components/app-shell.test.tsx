import type {
  DashboardResponse,
  NotificationItem,
  UiPreferences,
} from '@nexus/shared';
import { render, screen } from '@testing-library/react';
import { AppShell } from './app-shell';

const preferences: UiPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  compactMode: false,
  accent: 'aurora',
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
    render(
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
        onAccentChange={() => {}}
        onCompactToggle={() => {}}
        onLayoutPresetChange={() => {}}
        onMarkAllRead={() => {}}
        onNotificationToggle={() => {}}
        onSidebarToggle={() => {}}
        onSignOut={() => {}}
        onThemeChange={() => {}}
        preferences={preferences}
        section="overview"
        unreadCount={1}
        userName="Primary Operator"
        websocketStatus="connected"
        widgets={[
          {
            id: 'overview-health',
            title: 'Fleet Health',
            eyebrow: 'Fleet snapshot',
            detail: 'Health summaries are sourced from the backend heartbeat.',
            metric: 'Healthy',
            state: 'ready',
            lines: ['Core platform online'],
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
    expect(screen.getByText('Fleet Health')).toBeInTheDocument();
    expect(screen.getByText('1 unread item')).toBeInTheDocument();
    expect(screen.getByText('Core platform online')).toBeInTheDocument();
  });
});
