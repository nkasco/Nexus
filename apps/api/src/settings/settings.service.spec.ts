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
  });

  it('reads stored preferences and falls back for malformed values', async () => {
    const service = new SettingsService({
      userSetting: {
        findMany: vi.fn().mockResolvedValue([
          { key: 'ui.theme', value: 'light' },
          { key: 'ui.sidebarCollapsed', value: 'true' },
          { key: 'ui.compactMode', value: 'not-a-boolean' },
          { key: 'ui.accent', value: 'invalid-accent' },
        ]),
      },
    } as never);

    await expect(service.getPreferences()).resolves.toEqual({
      theme: 'light',
      sidebarCollapsed: true,
      compactMode: false,
      accent: 'graphite',
    });
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
});
