import type { NotificationItem } from './notifications';
import type { DashboardResponse } from './dashboards';
import type {
  IntegrationProvider,
  IntegrationStatus,
} from './integrations';
import type { UiPreferences } from './settings';

export type RealtimeEventType =
  | 'realtime.connected'
  | 'system.pulse'
  | 'notification.created'
  | 'dashboard.updated'
  | 'settings.updated'
  | 'integration.synced'
  | 'integration.sync_failed'
  | 'assets.updated'
  | 'metrics.updated';

export interface RealtimeEvent<TPayload = unknown> {
  type: RealtimeEventType;
  payload: TPayload;
  sentAt: string;
}

export interface RealtimeConnectedPayload {
  connectedClients: number;
}

export interface SystemPulsePayload {
  connectedClients: number;
  serverTime: string;
  uptimeSeconds: number;
}

export interface IntegrationSyncPayload {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  assetCount: number;
  metricCount: number;
  syncedAt: string;
  error?: string;
}

export interface AssetUpdatePayload {
  provider: IntegrationProvider;
  changedAssets: number;
  totalAssets: number;
}

export interface MetricUpdatePayload {
  provider: IntegrationProvider;
  changedMetrics: number;
  totalMetrics: number;
}

export type RealtimePayloadMap = {
  'realtime.connected': RealtimeConnectedPayload;
  'system.pulse': SystemPulsePayload;
  'notification.created': NotificationItem;
  'dashboard.updated': DashboardResponse;
  'settings.updated': UiPreferences;
  'integration.synced': IntegrationSyncPayload;
  'integration.sync_failed': IntegrationSyncPayload;
  'assets.updated': AssetUpdatePayload;
  'metrics.updated': MetricUpdatePayload;
};
