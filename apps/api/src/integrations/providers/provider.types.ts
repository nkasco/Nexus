import type {
  AssetStatus,
  IntegrationActionDefinition,
  IntegrationProvider,
  IntegrationStatus,
  JsonObject,
  MetricSnapshotStatus,
} from '@nexus/shared';

export interface ProviderCredentialDefinition {
  key: string;
  label: string;
  envVar: string;
  sensitive: boolean;
}

export interface AssetReference {
  assetType: string;
  externalId: string;
}

export interface NormalizedAssetInput {
  assetType: string;
  externalId: string;
  name: string;
  status: AssetStatus;
  summary: string;
  metadata?: JsonObject;
}

export interface NormalizedMetricInput {
  key: string;
  label: string;
  unit?: string;
  valueText: string;
  valueNumber?: number;
  status: MetricSnapshotStatus;
  metadata?: JsonObject;
  assetRef?: AssetReference;
}

export interface ProviderSyncContext {
  now: Date;
  credentials: Record<string, string | undefined>;
}

export interface ProviderSyncResult {
  status: Extract<IntegrationStatus, 'healthy' | 'degraded'>;
  headline: string;
  highlights: string[];
  assets: NormalizedAssetInput[];
  metrics: NormalizedMetricInput[];
}

export interface ProviderAdapter {
  provider: IntegrationProvider;
  displayName: string;
  syncIntervalSeconds: number;
  credentials: ProviderCredentialDefinition[];
  actions: IntegrationActionDefinition[];
  sync(context: ProviderSyncContext): Promise<ProviderSyncResult>;
}
