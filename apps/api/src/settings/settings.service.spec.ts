import { BadRequestException } from '@nestjs/common';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('returns defaults when there are no saved settings', async () => {
    const service = new SettingsService({
      userSetting: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    } as never);

    await expect(service.getPreferences()).resolves.toEqual({
      theme: 'dark',
      sidebarCollapsed: false,
      compactMode: false,
      accent: 'graphite',
    });
    await expect(service.getOperatorPreferences()).resolves.toEqual({
      defaultLandingSection: 'overview',
      autoOpenNotifications: false,
      use24HourTime: false,
    });
  });

  it('builds a settings overview with notification readiness and ownership audit data', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'telegram-secret';
    process.env.DISCORD_WEBHOOK_URL = '';

    const service = new SettingsService({
      userSetting: {
        findMany: vi.fn().mockResolvedValue([
          { key: 'ui.theme', value: 'light' },
          { key: 'operator.defaultLandingSection', value: 'alerts' },
          { key: 'notifications.enabled', value: 'true' },
          { key: 'notifications.minimumSeverity', value: 'error' },
          { key: 'notifications.channels.telegram.enabled', value: 'true' },
          {
            key: 'notifications.channels.telegram.fields.chatId',
            value: '123456',
          },
        ]),
      },
    } as never);

    const overview = await service.getSettingsOverview();

    expect(overview.ui.theme).toBe('light');
    expect(overview.operator.defaultLandingSection).toBe('alerts');
    expect(overview.notifications.notificationsEnabled).toBe(true);
    expect(overview.notifications.minimumSeverity).toBe('error');
    expect(
      overview.notifications.channels.find(
        (channel) => channel.channel === 'telegram',
      ),
    ).toEqual(
      expect.objectContaining({
        enabled: true,
        configured: true,
      }),
    );
    expect(overview.configurationAudit).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'integration-runtime',
          ownership: 'in-app',
        }),
        expect.objectContaining({
          id: 'notification-secrets',
          ownership: 'environment',
        }),
      ]),
    );

    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.DISCORD_WEBHOOK_URL;
  });

  it('persists sanitized preference updates', async () => {
    const upsert = vi.fn();
    const service = new SettingsService({
      userSetting: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert,
      },
    } as never);

    const result = await service.updatePreferences({
      theme: 'dark',
      compactMode: true,
      sidebarCollapsed: true,
    });

    expect(result).toEqual({
      theme: 'dark',
      sidebarCollapsed: true,
      compactMode: true,
      accent: 'graphite',
    });
    expect(upsert).toHaveBeenCalledTimes(4);
  });

  it('updates operator preferences with validation', async () => {
    const upsert = vi.fn();
    const service = new SettingsService({
      userSetting: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert,
      },
    } as never);

    await expect(
      service.updateOperatorPreferences({
        defaultLandingSection: 'metrics',
        autoOpenNotifications: true,
        use24HourTime: true,
      }),
    ).resolves.toEqual({
      defaultLandingSection: 'metrics',
      autoOpenNotifications: true,
      use24HourTime: true,
    });

    await expect(
      service.updateOperatorPreferences({
        defaultLandingSection: 'settings' as never,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates notification settings and rejects invalid smtp ports', async () => {
    const store = new Map<string, string>();
    const upsert = vi
      .fn()
      .mockImplementation(
        ({ create, update, where }: {
          create: { key: string; value: string };
          update: { value: string };
          where: { key: string };
        }) => {
          store.set(where.key, update.value ?? create.value);
        },
      );
    const findMany = vi
      .fn()
      .mockImplementation(
        ({ where }: { where: { key: { in: string[] } } }) =>
          where.key.in
            .filter((key) => store.has(key))
            .map((key) => ({
              key,
              value: store.get(key) ?? '',
            })),
      );
    const service = new SettingsService({
      userSetting: {
        findMany,
        upsert,
      },
    } as never);

    await expect(
      service.updateNotificationSettings({
        notificationsEnabled: true,
        defaultChannel: 'email',
        channels: [
          {
            channel: 'email',
            enabled: true,
            fieldValues: {
              host: 'smtp.example.com',
              port: '2525',
              from: 'nexus@example.com',
            },
          },
        ],
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        notificationsEnabled: true,
        defaultChannel: 'email',
      }),
    );

    await expect(
      service.updateNotificationSettings({
        channels: [
          {
            channel: 'email',
            fieldValues: {
              port: 'invalid',
            },
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
