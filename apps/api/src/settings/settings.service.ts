import { Injectable } from '@nestjs/common';
import type { UiPreferences } from '@nexus/shared';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_PREFERENCES: UiPreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  compactMode: false,
  accent: 'graphite',
};

const PREFERENCE_KEYS = {
  theme: 'ui.theme',
  sidebarCollapsed: 'ui.sidebarCollapsed',
  compactMode: 'ui.compactMode',
  accent: 'ui.accent',
} as const;

type StoredPreferenceEntry = {
  key: string;
  value: string;
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(): Promise<UiPreferences> {
    const entries: StoredPreferenceEntry[] =
      await this.prisma.userSetting.findMany({
        select: {
          key: true,
          value: true,
        },
        where: {
          key: {
            in: Object.values(PREFERENCE_KEYS),
          },
        },
      });

    const settingsMap = new Map<string, string>(
      entries.map(({ key, value }) => [key, value] as const),
    );

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

  async updatePreferences(
    updates: Partial<UiPreferences>,
  ): Promise<UiPreferences> {
    const nextPreferences = {
      ...(await this.getPreferences()),
      ...this.sanitize(updates),
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

  private sanitize(updates: Partial<UiPreferences>): Partial<UiPreferences> {
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

  private isThemePreference(value: unknown): value is UiPreferences['theme'] {
    return value === 'light' || value === 'dark' || value === 'system';
  }

  private isAccentPreference(value: unknown): value is UiPreferences['accent'] {
    return value === 'aurora' || value === 'graphite';
  }
}
