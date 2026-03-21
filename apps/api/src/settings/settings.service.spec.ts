import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('returns defaults when there are no saved settings', async () => {
    const service = new SettingsService({
      userSetting: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as never);

    await expect(service.getPreferences()).resolves.toEqual({
      theme: 'system',
      sidebarCollapsed: false,
      compactMode: false,
      accent: 'aurora',
    });
  });

  it('persists sanitized preference updates', async () => {
    const upsert = jest.fn();
    const service = new SettingsService({
      userSetting: {
        findMany: jest.fn().mockResolvedValue([]),
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
      accent: 'aurora',
    });
    expect(upsert).toHaveBeenCalledTimes(4);
  });
});
