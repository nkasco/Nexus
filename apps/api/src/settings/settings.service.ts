import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  ConfigurationAuditItem,
  DashboardSlug,
  NotificationChannel,
  NotificationChannelField,
  NotificationSettings,
  OperatorPreferences,
  SettingsOverviewResponse,
  UiPreferences,
  UpdateNotificationSettingsRequest,
} from '@nexus/shared';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_PREFERENCES: UiPreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  compactMode: false,
  accent: 'graphite',
};

const DEFAULT_OPERATOR_PREFERENCES: OperatorPreferences = {
  defaultLandingSection: 'overview',
  autoOpenNotifications: false,
  use24HourTime: false,
};

const DEFAULT_NOTIFICATION_SETTINGS = {
  notificationsEnabled: false,
  minimumSeverity: 'warning',
  defaultChannel: 'discord',
} as const satisfies Pick<
  NotificationSettings,
  'notificationsEnabled' | 'minimumSeverity' | 'defaultChannel'
>;

const PREFERENCE_KEYS = {
  theme: 'ui.theme',
  sidebarCollapsed: 'ui.sidebarCollapsed',
  compactMode: 'ui.compactMode',
  accent: 'ui.accent',
} as const;

const OPERATOR_KEYS = {
  defaultLandingSection: 'operator.defaultLandingSection',
  autoOpenNotifications: 'operator.autoOpenNotifications',
  use24HourTime: 'operator.use24HourTime',
} as const;

const NOTIFICATION_KEYS = {
  notificationsEnabled: 'notifications.enabled',
  minimumSeverity: 'notifications.minimumSeverity',
  defaultChannel: 'notifications.defaultChannel',
  channelEnabled: (channel: NotificationChannel) =>
    `notifications.channels.${channel}.enabled`,
  fieldValue: (channel: NotificationChannel, fieldKey: string) =>
    `notifications.channels.${channel}.fields.${fieldKey}`,
} as const;

type StoredPreferenceEntry = {
  key: string;
  value: string;
};

type NotificationFieldDefinition = {
  key: string;
  label: string;
  description: string;
  envVar: string;
  sensitive: boolean;
  editable: boolean;
};

type NotificationChannelDefinition = {
  channel: NotificationChannel;
  label: string;
  description: string;
  fields: NotificationFieldDefinition[];
};

const notificationChannelDefinitions: NotificationChannelDefinition[] = [
  {
    channel: 'discord',
    label: 'Discord',
    description:
      'Route alert fanout into a Discord server once Phase 5 delivery is enabled.',
    fields: [
      {
        key: 'webhookUrl',
        label: 'Webhook URL',
        description:
          'Secret delivery endpoint kept environment-only until encrypted secret storage exists.',
        envVar: 'DISCORD_WEBHOOK_URL',
        sensitive: true,
        editable: false,
      },
    ],
  },
  {
    channel: 'telegram',
    label: 'Telegram',
    description:
      'Configure the target chat in-app while keeping the bot token deployment-managed.',
    fields: [
      {
        key: 'botToken',
        label: 'Bot token',
        description:
          'Secret token remains environment-only until Phase 5 introduces encrypted secret management.',
        envVar: 'TELEGRAM_BOT_TOKEN',
        sensitive: true,
        editable: false,
      },
      {
        key: 'chatId',
        label: 'Chat ID',
        description:
          'Optional in-app override for the target chat. Leave blank to keep using the environment variable.',
        envVar: 'TELEGRAM_CHAT_ID',
        sensitive: false,
        editable: true,
      },
    ],
  },
  {
    channel: 'email',
    label: 'Email',
    description:
      'SMTP routing details can live in Nexus while the password stays in the environment.',
    fields: [
      {
        key: 'host',
        label: 'SMTP host',
        description:
          'Hostname for the SMTP relay. Leave blank to keep using the environment value.',
        envVar: 'SMTP_HOST',
        sensitive: false,
        editable: true,
      },
      {
        key: 'port',
        label: 'SMTP port',
        description:
          'Port for the SMTP relay. Leave blank to keep using the environment value.',
        envVar: 'SMTP_PORT',
        sensitive: false,
        editable: true,
      },
      {
        key: 'user',
        label: 'SMTP user',
        description:
          'Username for authenticated SMTP delivery. Leave blank to keep using the environment value.',
        envVar: 'SMTP_USER',
        sensitive: false,
        editable: true,
      },
      {
        key: 'password',
        label: 'SMTP password',
        description:
          'Secret password remains environment-only until encrypted secret storage exists.',
        envVar: 'SMTP_PASSWORD',
        sensitive: true,
        editable: false,
      },
      {
        key: 'from',
        label: 'From address',
        description:
          'Default sender address for alert delivery. Leave blank to keep using the environment value.',
        envVar: 'SMTP_FROM',
        sensitive: false,
        editable: true,
      },
    ],
  },
];

const configurationAudit: ConfigurationAuditItem[] = [
  {
    id: 'auth-admin-session',
    domain: 'authentication',
    label: 'Admin identity and JWT session secrets',
    ownership: 'environment',
    summary:
      'Single-admin credentials, session TTL, and signing secrets stay deployment-managed.',
    phaseCoverage:
      'Phase 1 added login and session handling, but the values remain intentionally environment-only.',
  },
  {
    id: 'appearance-preferences',
    domain: 'appearance',
    label: 'Theme, accent, density, and sidebar state',
    ownership: 'in-app',
    summary:
      'Every shell appearance control now has a dedicated in-app home instead of living only in header shortcuts.',
    phaseCoverage:
      'Phase 1 covered these as quick controls. Phase 3.5 centralizes them in Settings without removing the fast path.',
  },
  {
    id: 'dashboard-behavior',
    domain: 'dashboards',
    label: 'Landing page and operator display behavior',
    ownership: 'in-app',
    summary:
      'Default landing surface, realtime notification behavior, and time formatting are managed in-app.',
    phaseCoverage:
      'These gaps were not covered by the original Phase 1 settings model and are added in Phase 3.5.',
  },
  {
    id: 'integration-runtime',
    domain: 'integrations',
    label: 'Provider enablement, polling cadence, and connection URLs',
    ownership: 'in-app',
    summary:
      'Operators can now enable or disable providers, tune polling intervals, and override non-secret connection details in-app.',
    phaseCoverage:
      'Phase 2 and 3 exposed integration data but left configuration as an operator gap that Phase 3.5 closes.',
  },
  {
    id: 'integration-secrets',
    domain: 'integrations',
    label: 'Provider tokens, passwords, and access secrets',
    ownership: 'environment',
    summary:
      'Secret credential material stays environment-only until at-rest encryption is implemented.',
    phaseCoverage:
      'Phase 2 seeded secret references only. Phase 3.5 keeps that boundary explicit in the UI.',
  },
  {
    id: 'notification-routing',
    domain: 'notifications',
    label: 'Alert fanout defaults and non-secret delivery metadata',
    ownership: 'in-app',
    summary:
      'Channel enablement, minimum severity, default route, and non-secret delivery fields are now configurable in-app.',
    phaseCoverage:
      'Phase 1 only provided the notification center surface. Phase 3.5 adds the operator configuration workflow behind it.',
  },
  {
    id: 'notification-secrets',
    domain: 'notifications',
    label: 'Discord, Telegram, and SMTP secrets',
    ownership: 'environment',
    summary:
      'Webhook URLs, bot tokens, and SMTP passwords remain deployment-managed until secure secret storage lands.',
    phaseCoverage:
      'Phase 3.5 documents the current boundary so Phase 5 delivery work has a clear prerequisite path.',
  },
  {
    id: 'future-alert-rules',
    domain: 'platform',
    label: 'Alert rules, test sends, and write-action safeguards',
    ownership: 'deferred',
    summary:
      'These workflows intentionally wait for later phases where alert delivery and safe actions become active features.',
    phaseCoverage:
      'The work stays explicitly deferred rather than being left as an undocumented gap.',
  },
];

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettingsOverview(): Promise<SettingsOverviewResponse> {
    const settingsMap = await this.readSettingsMap(this.allSettingKeys());

    return {
      ui: this.preferencesFromMap(settingsMap),
      operator: this.operatorPreferencesFromMap(settingsMap),
      notifications: this.notificationSettingsFromMap(settingsMap),
      configurationAudit,
    };
  }

  async getPreferences(): Promise<UiPreferences> {
    return this.preferencesFromMap(
      await this.readSettingsMap(Object.values(PREFERENCE_KEYS)),
    );
  }

  async updatePreferences(
    updates: Partial<UiPreferences>,
  ): Promise<UiPreferences> {
    const nextPreferences = {
      ...(await this.getPreferences()),
      ...this.sanitizePreferences(updates),
    };

    await Promise.all([
      this.writeSetting(PREFERENCE_KEYS.theme, nextPreferences.theme),
      this.writeSetting(
        PREFERENCE_KEYS.sidebarCollapsed,
        JSON.stringify(nextPreferences.sidebarCollapsed),
      ),
      this.writeSetting(
        PREFERENCE_KEYS.compactMode,
        JSON.stringify(nextPreferences.compactMode),
      ),
      this.writeSetting(PREFERENCE_KEYS.accent, nextPreferences.accent),
    ]);

    return nextPreferences;
  }

  async getOperatorPreferences(): Promise<OperatorPreferences> {
    return this.operatorPreferencesFromMap(
      await this.readSettingsMap(Object.values(OPERATOR_KEYS)),
    );
  }

  async updateOperatorPreferences(
    updates: Partial<OperatorPreferences>,
  ): Promise<OperatorPreferences> {
    const current = await this.getOperatorPreferences();
    const nextPreferences: OperatorPreferences = {
      defaultLandingSection:
        updates.defaultLandingSection === undefined
          ? current.defaultLandingSection
          : this.validateDashboardSlug(updates.defaultLandingSection),
      autoOpenNotifications:
        updates.autoOpenNotifications === undefined
          ? current.autoOpenNotifications
          : this.validateBoolean(
              updates.autoOpenNotifications,
              'autoOpenNotifications',
            ),
      use24HourTime:
        updates.use24HourTime === undefined
          ? current.use24HourTime
          : this.validateBoolean(updates.use24HourTime, 'use24HourTime'),
    };

    await Promise.all([
      this.writeSetting(
        OPERATOR_KEYS.defaultLandingSection,
        nextPreferences.defaultLandingSection,
      ),
      this.writeSetting(
        OPERATOR_KEYS.autoOpenNotifications,
        JSON.stringify(nextPreferences.autoOpenNotifications),
      ),
      this.writeSetting(
        OPERATOR_KEYS.use24HourTime,
        JSON.stringify(nextPreferences.use24HourTime),
      ),
    ]);

    return nextPreferences;
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.notificationSettingsFromMap(
      await this.readSettingsMap(this.notificationSettingKeys()),
    );
  }

  async updateNotificationSettings(
    updates: UpdateNotificationSettingsRequest,
  ): Promise<NotificationSettings> {
    const current = await this.getNotificationSettings();
    const channelUpdates = new Map(
      (updates.channels ?? []).map((channelUpdate) => [
        channelUpdate.channel,
        channelUpdate,
      ]),
    );

    const nextSettings: NotificationSettings = {
      notificationsEnabled:
        updates.notificationsEnabled === undefined
          ? current.notificationsEnabled
          : this.validateBoolean(
              updates.notificationsEnabled,
              'notificationsEnabled',
            ),
      minimumSeverity:
        updates.minimumSeverity === undefined
          ? current.minimumSeverity
          : this.validateNotificationSeverity(updates.minimumSeverity),
      defaultChannel:
        updates.defaultChannel === undefined
          ? current.defaultChannel
          : this.validateNotificationChannel(updates.defaultChannel),
      channels: current.channels.map((channel) => {
        const nextUpdate = channelUpdates.get(channel.channel);

        if (!nextUpdate) {
          return channel;
        }

        return {
          ...channel,
          enabled:
            nextUpdate.enabled === undefined
              ? channel.enabled
              : this.validateBoolean(nextUpdate.enabled, `${channel.channel}.enabled`),
          fields: channel.fields.map((field) => {
            const nextFieldValue = nextUpdate.fieldValues?.[field.key];

            if (nextFieldValue === undefined) {
              return field;
            }

            if (!field.editable) {
              return field;
            }

            const sanitizedValue = this.sanitizeNotificationFieldValue(
              channel.channel,
              field.key,
              nextFieldValue,
            );

            return {
              ...field,
              value: sanitizedValue,
              source: sanitizedValue ? 'stored' : 'environment',
            };
          }),
        };
      }),
    };

    await Promise.all([
      this.writeSetting(
        NOTIFICATION_KEYS.notificationsEnabled,
        JSON.stringify(nextSettings.notificationsEnabled),
      ),
      this.writeSetting(
        NOTIFICATION_KEYS.minimumSeverity,
        nextSettings.minimumSeverity,
      ),
      this.writeSetting(
        NOTIFICATION_KEYS.defaultChannel,
        nextSettings.defaultChannel,
      ),
      ...nextSettings.channels.flatMap((channel) => [
        this.writeSetting(
          NOTIFICATION_KEYS.channelEnabled(channel.channel),
          JSON.stringify(channel.enabled),
        ),
        ...channel.fields
          .filter((field) => field.editable)
          .map((field) =>
            this.writeSetting(
              NOTIFICATION_KEYS.fieldValue(channel.channel, field.key),
              field.value.trim().length > 0 ? field.value.trim() : `env:${field.envVar}`,
            ),
          ),
      ]),
    ]);

    return this.getNotificationSettings();
  }

  private async readSettingsMap(keys: readonly string[]) {
    const entries: StoredPreferenceEntry[] =
      await this.prisma.userSetting.findMany({
        select: {
          key: true,
          value: true,
        },
        where: {
          key: {
            in: [...keys],
          },
        },
      });

    return new Map<string, string>(
      entries.map(({ key, value }) => [key, value] as const),
    );
  }

  private allSettingKeys() {
    return [
      ...Object.values(PREFERENCE_KEYS),
      ...Object.values(OPERATOR_KEYS),
      ...this.notificationSettingKeys(),
    ] as const;
  }

  private notificationSettingKeys() {
    return [
      NOTIFICATION_KEYS.notificationsEnabled,
      NOTIFICATION_KEYS.minimumSeverity,
      NOTIFICATION_KEYS.defaultChannel,
      ...notificationChannelDefinitions.flatMap((channel) => [
        NOTIFICATION_KEYS.channelEnabled(channel.channel),
        ...channel.fields
          .filter((field) => field.editable)
          .map((field) =>
            NOTIFICATION_KEYS.fieldValue(channel.channel, field.key),
          ),
      ]),
    ] as const;
  }

  private preferencesFromMap(settingsMap: Map<string, string>): UiPreferences {
    return {
      theme: this.readTheme(settingsMap.get(PREFERENCE_KEYS.theme)),
      sidebarCollapsed: this.readBoolean(
        settingsMap.get(PREFERENCE_KEYS.sidebarCollapsed),
        DEFAULT_PREFERENCES.sidebarCollapsed,
      ),
      compactMode: this.readBoolean(
        settingsMap.get(PREFERENCE_KEYS.compactMode),
        DEFAULT_PREFERENCES.compactMode,
      ),
      accent: this.readAccent(settingsMap.get(PREFERENCE_KEYS.accent)),
    };
  }

  private operatorPreferencesFromMap(
    settingsMap: Map<string, string>,
  ): OperatorPreferences {
    return {
      defaultLandingSection: this.readDashboardSlug(
        settingsMap.get(OPERATOR_KEYS.defaultLandingSection),
        DEFAULT_OPERATOR_PREFERENCES.defaultLandingSection,
      ),
      autoOpenNotifications: this.readBoolean(
        settingsMap.get(OPERATOR_KEYS.autoOpenNotifications),
        DEFAULT_OPERATOR_PREFERENCES.autoOpenNotifications,
      ),
      use24HourTime: this.readBoolean(
        settingsMap.get(OPERATOR_KEYS.use24HourTime),
        DEFAULT_OPERATOR_PREFERENCES.use24HourTime,
      ),
    };
  }

  private notificationSettingsFromMap(
    settingsMap: Map<string, string>,
  ): NotificationSettings {
    const channels = notificationChannelDefinitions.map((definition) => {
      const fields = definition.fields.map((field) =>
        this.readNotificationField(definition.channel, field, settingsMap),
      );

      return {
        channel: definition.channel,
        label: definition.label,
        description: definition.description,
        enabled: this.readBoolean(
          settingsMap.get(NOTIFICATION_KEYS.channelEnabled(definition.channel)),
          false,
        ),
        configured: fields.every((field) => field.configured),
        fields,
      };
    });

    return {
      notificationsEnabled: this.readBoolean(
        settingsMap.get(NOTIFICATION_KEYS.notificationsEnabled),
        DEFAULT_NOTIFICATION_SETTINGS.notificationsEnabled,
      ),
      minimumSeverity: this.readNotificationSeverity(
        settingsMap.get(NOTIFICATION_KEYS.minimumSeverity),
        DEFAULT_NOTIFICATION_SETTINGS.minimumSeverity,
      ),
      defaultChannel: this.readNotificationChannel(
        settingsMap.get(NOTIFICATION_KEYS.defaultChannel),
        DEFAULT_NOTIFICATION_SETTINGS.defaultChannel,
      ),
      channels,
    };
  }

  private readNotificationField(
    channel: NotificationChannel,
    definition: NotificationFieldDefinition,
    settingsMap: Map<string, string>,
  ): NotificationChannelField {
    const storedValue = definition.editable
      ? settingsMap.get(NOTIFICATION_KEYS.fieldValue(channel, definition.key)) ??
        `env:${definition.envVar}`
      : `env:${definition.envVar}`;
    const resolved = this.resolveSettingValue(storedValue, definition.envVar);

    return {
      key: definition.key,
      label: definition.label,
      description: definition.description,
      value: resolved.source === 'stored' ? resolved.value : '',
      envVar: definition.envVar,
      sensitive: definition.sensitive,
      editable: definition.editable,
      configured: resolved.configured,
      source: resolved.source,
    };
  }

  private sanitizePreferences(
    updates: Partial<UiPreferences>,
  ): Partial<UiPreferences> {
    return {
      ...(this.isThemePreference(updates.theme)
        ? { theme: updates.theme }
        : {}),
      ...(typeof updates.sidebarCollapsed === 'boolean'
        ? { sidebarCollapsed: updates.sidebarCollapsed }
        : {}),
      ...(typeof updates.compactMode === 'boolean'
        ? { compactMode: updates.compactMode }
        : {}),
      ...(this.isAccentPreference(updates.accent)
        ? { accent: updates.accent }
        : {}),
    };
  }

  private sanitizeNotificationFieldValue(
    channel: NotificationChannel,
    fieldKey: string,
    value: string,
  ) {
    const normalized = value.trim();

    if (channel === 'email' && fieldKey === 'port' && normalized.length > 0) {
      const parsedPort = Number.parseInt(normalized, 10);

      if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
        throw new BadRequestException(
          'SMTP port must be an integer between 1 and 65535.',
        );
      }

      return String(parsedPort);
    }

    return normalized;
  }

  private validateDashboardSlug(value: unknown): DashboardSlug {
    if (
      value === 'overview' ||
      value === 'home-lab' ||
      value === 'media' ||
      value === 'devops' ||
      value === 'metrics' ||
      value === 'alerts'
    ) {
      return value;
    }

    throw new BadRequestException('Unsupported dashboard selection.');
  }

  private validateBoolean(value: unknown, field: string) {
    if (typeof value === 'boolean') {
      return value;
    }

    throw new BadRequestException(`${field} must be a boolean value.`);
  }

  private validateNotificationSeverity(
    value: unknown,
  ): NotificationSettings['minimumSeverity'] {
    if (value === 'info' || value === 'warning' || value === 'error') {
      return value;
    }

    throw new BadRequestException('Unsupported notification severity.');
  }

  private validateNotificationChannel(value: unknown): NotificationChannel {
    if (value === 'discord' || value === 'telegram' || value === 'email') {
      return value;
    }

    throw new BadRequestException('Unsupported notification channel.');
  }

  private async writeSetting(key: string, value: string) {
    await this.prisma.userSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  private readBoolean(value: string | undefined, fallback: boolean) {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return fallback;
  }

  private readTheme(value: string | undefined): UiPreferences['theme'] {
    if (this.isThemePreference(value)) {
      return value;
    }

    return DEFAULT_PREFERENCES.theme;
  }

  private readAccent(value: string | undefined): UiPreferences['accent'] {
    if (this.isAccentPreference(value)) {
      return value;
    }

    return DEFAULT_PREFERENCES.accent;
  }

  private readDashboardSlug(
    value: string | undefined,
    fallback: DashboardSlug,
  ): DashboardSlug {
    try {
      return this.validateDashboardSlug(value);
    } catch {
      return fallback;
    }
  }

  private readNotificationSeverity(
    value: string | undefined,
    fallback: NotificationSettings['minimumSeverity'],
  ): NotificationSettings['minimumSeverity'] {
    if (value === 'info' || value === 'warning' || value === 'error') {
      return value;
    }

    return fallback;
  }

  private readNotificationChannel(
    value: string | undefined,
    fallback: NotificationChannel,
  ): NotificationChannel {
    if (value === 'discord' || value === 'telegram' || value === 'email') {
      return value;
    }

    return fallback;
  }

  private resolveSettingValue(value: string | undefined, envVar: string) {
    if (!value || value.trim().length === 0) {
      return {
        source: 'missing' as const,
        value: '',
        configured: false,
      };
    }

    if (value.startsWith('env:')) {
      const envKey = value.slice(4) || envVar;

      return {
        source: 'environment' as const,
        value: '',
        configured: Boolean(process.env[envKey]),
      };
    }

    return {
      source: 'stored' as const,
      value,
      configured: true,
    };
  }

  private isThemePreference(value: unknown): value is UiPreferences['theme'] {
    return value === 'light' || value === 'dark' || value === 'system';
  }

  private isAccentPreference(value: unknown): value is UiPreferences['accent'] {
    return value === 'aurora' || value === 'graphite';
  }
}
