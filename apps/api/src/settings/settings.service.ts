import { Injectable } from '@nestjs/common';
import type { UiPreferences } from '@nexus/shared';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_PREFERENCES: UiPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  compactMode: false,
  accent: 'aurora',
};

const PREFERENCE_KEYS = {
  theme: 'ui.theme',
  sidebarCollapsed: 'ui.sidebarCollapsed',
  compactMode: 'ui.compactMode',
  accent: 'ui.accent',
} as const;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(): Promise<UiPreferences> {
    const entries = await this.prisma.userSetting.findMany({
      where: {
        key: {
          in: Object.values(PREFERENCE_KEYS),
        },
      },
    });

    const settingsMap = new Map(
      entries.map((entry) => [entry.key, entry.value]),
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
      ...(updates.theme && ['system', 'light', 'dark'].includes(updates.theme)
        ? { theme: updates.theme }
        : {}),
      ...(typeof updates.sidebarCollapsed === 'boolean'
        ? { sidebarCollapsed: updates.sidebarCollapsed }
        : {}),
      ...(typeof updates.compactMode === 'boolean'
        ? { compactMode: updates.compactMode }
        : {}),
      ...(updates.accent && ['aurora', 'graphite'].includes(updates.accent)
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
    return value ? value === 'true' : fallback;
  }

  private readTheme(value: string | undefined): UiPreferences['theme'] {
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }

    return DEFAULT_PREFERENCES.theme;
  }

  private readAccent(value: string | undefined): UiPreferences['accent'] {
    if (value === 'aurora' || value === 'graphite') {
      return value;
    }

    return DEFAULT_PREFERENCES.accent;
  }
}
