import type { DashboardSlug } from './dashboards';

export type ThemePreference = 'system' | 'light' | 'dark';
export type AccentPreference = 'aurora' | 'graphite';
export type NotificationMinimumSeverity = 'info' | 'warning' | 'error';
export type NotificationChannel = 'discord' | 'telegram' | 'email';
export type SettingsOwnership = 'in-app' | 'environment' | 'deferred';
export type SettingsDomain =
  | 'authentication'
  | 'appearance'
  | 'dashboards'
  | 'integrations'
  | 'notifications'
  | 'platform';
export type SettingsValueSource = 'stored' | 'environment' | 'missing';

export interface UiPreferences {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  accent: AccentPreference;
}

export interface OperatorPreferences {
  defaultLandingSection: DashboardSlug;
  autoOpenNotifications: boolean;
  use24HourTime: boolean;
}

export interface NotificationChannelField {
  key: string;
  label: string;
  description: string;
  value: string;
  envVar: string;
  sensitive: boolean;
  editable: boolean;
  configured: boolean;
  source: SettingsValueSource;
}

export interface NotificationChannelSettings {
  channel: NotificationChannel;
  label: string;
  description: string;
  enabled: boolean;
  configured: boolean;
  fields: NotificationChannelField[];
}

export interface NotificationSettings {
  notificationsEnabled: boolean;
  minimumSeverity: NotificationMinimumSeverity;
  defaultChannel: NotificationChannel;
  channels: NotificationChannelSettings[];
}

export interface ConfigurationAuditItem {
  id: string;
  domain: SettingsDomain;
  label: string;
  ownership: SettingsOwnership;
  summary: string;
  phaseCoverage: string;
}

export interface SettingsOverviewResponse {
  ui: UiPreferences;
  operator: OperatorPreferences;
  notifications: NotificationSettings;
  configurationAudit: ConfigurationAuditItem[];
}

export interface UpdateNotificationSettingsRequest {
  notificationsEnabled?: boolean;
  minimumSeverity?: NotificationMinimumSeverity;
  defaultChannel?: NotificationChannel;
  channels?: Array<{
    channel: NotificationChannel;
    enabled?: boolean;
    fieldValues?: Record<string, string>;
  }>;
}
