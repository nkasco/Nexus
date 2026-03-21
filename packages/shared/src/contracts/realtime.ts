import type { NotificationItem } from './notifications';
import type { DashboardResponse } from './dashboards';
import type { UiPreferences } from './settings';

export type RealtimeEventType =
  | 'realtime.connected'
  | 'system.pulse'
  | 'notification.created'
  | 'dashboard.updated'
  | 'settings.updated';

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

export type RealtimePayloadMap = {
  'realtime.connected': RealtimeConnectedPayload;
  'system.pulse': SystemPulsePayload;
  'notification.created': NotificationItem;
  'dashboard.updated': DashboardResponse;
  'settings.updated': UiPreferences;
};
