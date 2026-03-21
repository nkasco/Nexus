export const integrationProviders = [
  'proxmox',
  'truenas',
  'unifi',
  'home-assistant',
  'plex',
  'github',
] as const;

export type IntegrationProvider = (typeof integrationProviders)[number];

export type IntegrationStatus =
  | 'pending'
  | 'syncing'
  | 'healthy'
  | 'degraded'
  | 'error'
  | 'disabled';

export type AssetStatus = 'online' | 'warning' | 'offline' | 'unknown';

export type MetricSnapshotStatus =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'unknown';

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export interface IntegrationCredentialRef {
  key: string;
  label: string;
  value: string;
  sensitive: boolean;
  configured: boolean;
}

export interface IntegrationActionDefinition {
  id: string;
  label: string;
  description: string;
  supported: boolean;
}

export interface IntegrationSyncState {
  status: IntegrationStatus;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  durationMs: number | null;
  assetCount: number;
  metricCount: number;
}

export interface AssetTypeSummary {
  type: string;
  total: number;
  online: number;
  warning: number;
  offline: number;
  unknown: number;
}

export interface IntegrationSummary {
  provider: IntegrationProvider;
  displayName: string;
  enabled: boolean;
  status: IntegrationStatus;
  pollingIntervalSeconds: number;
  headline: string;
  highlights: string[];
  syncState: IntegrationSyncState;
  assetsByType: AssetTypeSummary[];
}

export interface IntegrationAsset {
  id: string;
  provider: IntegrationProvider;
  assetType: string;
  externalId: string;
  name: string;
  status: AssetStatus;
  summary: string;
  metadata: JsonObject;
  lastSeenAt: string;
}

export interface CurrentMetricSnapshot {
  id: string;
  provider: IntegrationProvider;
  assetId: string | null;
  scopeKey: string;
  key: string;
  label: string;
  unit: string | null;
  valueText: string;
  valueNumber: number | null;
  status: MetricSnapshotStatus;
  metadata: JsonObject;
  observedAt: string;
}

export interface IntegrationsOverviewResponse {
  generatedAt: string;
  totals: {
    providers: number;
    healthyProviders: number;
    degradedProviders: number;
    assets: number;
    metrics: number;
  };
  integrations: IntegrationSummary[];
}

export interface IntegrationDetailResponse {
  integration: IntegrationSummary;
  credentials: IntegrationCredentialRef[];
  actions: IntegrationActionDefinition[];
  assets: IntegrationAsset[];
  metrics: CurrentMetricSnapshot[];
}
