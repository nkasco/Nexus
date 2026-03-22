import type {
  ConfigurationAuditItem,
  IntegrationDetailResponse,
  NotificationSettings,
  OperatorPreferences,
  UiPreferences,
} from '@nexus/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsWorkspace } from './settings-workspace';

const uiPreferences: UiPreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  compactMode: false,
  accent: 'graphite',
};

const operatorPreferences: OperatorPreferences = {
  defaultLandingSection: 'overview',
  autoOpenNotifications: false,
  use24HourTime: false,
};

const notificationSettings: NotificationSettings = {
  notificationsEnabled: true,
  minimumSeverity: 'warning',
  defaultChannel: 'discord',
  channels: [
    {
      channel: 'discord',
      label: 'Discord',
      description: 'Discord routing',
      enabled: true,
      configured: false,
      fields: [
        {
          key: 'webhookUrl',
          label: 'Webhook URL',
          description: 'Managed in env',
          value: '',
          envVar: 'DISCORD_WEBHOOK_URL',
          sensitive: true,
          editable: false,
          configured: false,
          source: 'environment',
        },
      ],
    },
    {
      channel: 'email',
      label: 'Email',
      description: 'SMTP route',
      enabled: false,
      configured: true,
      fields: [
        {
          key: 'host',
          label: 'SMTP host',
          description: 'Host override',
          value: 'smtp.example.com',
          envVar: 'SMTP_HOST',
          sensitive: false,
          editable: true,
          configured: true,
          source: 'stored',
        },
        {
          key: 'port',
          label: 'SMTP port',
          description: 'Port override',
          value: '587',
          envVar: 'SMTP_PORT',
          sensitive: false,
          editable: true,
          configured: true,
          source: 'stored',
        },
      ],
    },
    {
      channel: 'telegram',
      label: 'Telegram',
      description: 'Telegram route',
      enabled: false,
      configured: false,
      fields: [
        {
          key: 'botToken',
          label: 'Bot token',
          description: 'Managed in env',
          value: '',
          envVar: 'TELEGRAM_BOT_TOKEN',
          sensitive: true,
          editable: false,
          configured: false,
          source: 'environment',
        },
      ],
    },
  ],
};

const configurationAudit: ConfigurationAuditItem[] = [
  {
    id: 'appearance',
    domain: 'appearance',
    label: 'Shell appearance',
    ownership: 'in-app',
    summary: 'Theme and density',
    phaseCoverage: 'Phase 1 quick controls now live here too.',
  },
  {
    id: 'auth',
    domain: 'authentication',
    label: 'Admin secrets',
    ownership: 'environment',
    summary: 'JWT secret',
    phaseCoverage: 'Still env-managed.',
  },
  {
    id: 'alerts',
    domain: 'platform',
    label: 'Alert rules',
    ownership: 'deferred',
    summary: 'Phase 5',
    phaseCoverage: 'Explicitly deferred.',
  },
];

const integrations: IntegrationDetailResponse[] = [
  {
    integration: {
      provider: 'proxmox',
      displayName: 'Proxmox',
      enabled: true,
      status: 'healthy',
      pollingIntervalSeconds: 60,
      headline: 'Cluster online.',
      highlights: ['Everything looks healthy.'],
      syncState: {
        status: 'healthy',
        lastStartedAt: null,
        lastCompletedAt: null,
        lastSuccessAt: null,
        lastError: null,
        consecutiveFailures: 0,
        durationMs: null,
        assetCount: 0,
        metricCount: 0,
      },
      assetsByType: [],
    },
    credentials: [
      {
        key: 'baseUrl',
        label: 'Cluster API URL',
        value: 'https://pve.example.com',
        envVar: 'PROXMOX_BASE_URL',
        sensitive: false,
        editable: true,
        configured: true,
        source: 'stored',
      },
      {
        key: 'tokenSecret',
        label: 'API Token Secret',
        value: '',
        envVar: 'PROXMOX_TOKEN_SECRET',
        sensitive: true,
        editable: false,
        configured: false,
        source: 'environment',
      },
    ],
    actions: [],
    assets: [],
    metrics: [],
  },
];

describe('SettingsWorkspace', () => {
  it('renders the phase 3.5 settings surface', () => {
    render(
      <SettingsWorkspace
        configurationAudit={configurationAudit}
        integrations={integrations}
        notificationSettings={notificationSettings}
        onSaveIntegration={vi.fn()}
        onSaveNotifications={vi.fn()}
        onSaveOperator={vi.fn()}
        onSaveUi={vi.fn()}
        onSignOut={vi.fn()}
        operatorPreferences={operatorPreferences}
        uiPreferences={uiPreferences}
        userName="Primary Operator"
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Settings' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Provider configuration')).toBeInTheDocument();
    expect(screen.getByText('Channel readiness')).toBeInTheDocument();
    expect(screen.getByText('Shell appearance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open overview/ })).toHaveAttribute(
      'href',
      '/overview',
    );
  });

  it('blocks invalid polling intervals before saving an integration', async () => {
    const user = userEvent.setup();
    const onSaveIntegration = vi.fn();

    render(
      <SettingsWorkspace
        configurationAudit={configurationAudit}
        integrations={integrations}
        notificationSettings={notificationSettings}
        onSaveIntegration={onSaveIntegration}
        onSaveNotifications={vi.fn()}
        onSaveOperator={vi.fn()}
        onSaveUi={vi.fn()}
        onSignOut={vi.fn()}
        operatorPreferences={operatorPreferences}
        uiPreferences={uiPreferences}
        userName="Primary Operator"
      />,
    );

    const pollingInput = screen.getByDisplayValue('60');
    await user.clear(pollingInput);
    await user.type(pollingInput, '5');
    await user.click(screen.getByRole('button', { name: 'Save integration' }));

    expect(onSaveIntegration).not.toHaveBeenCalled();
    expect(
      screen.getByText('Polling must stay between 15 and 900 seconds.'),
    ).toBeInTheDocument();
  });
});
