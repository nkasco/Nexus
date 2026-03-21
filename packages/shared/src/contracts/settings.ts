export type ThemePreference = 'system' | 'light' | 'dark';
export type AccentPreference = 'aurora' | 'graphite';

export interface UiPreferences {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  accent: AccentPreference;
}
