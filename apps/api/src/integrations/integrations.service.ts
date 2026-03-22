import type { Prisma } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type {
  AssetTypeSummary,
  CurrentMetricSnapshot,
  IntegrationAsset,
  IntegrationCredentialRef,
  IntegrationDetailResponse,
  IntegrationProvider,
  IntegrationsOverviewResponse,
  IntegrationStatus,
  IntegrationSummary,
  JsonObject,
  JsonValue,
  UpdateIntegrationConfigurationRequest,
} from '@nexus/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { providerAdapters } from './providers/provider-registry';
import type {
  AssetReference,
  NormalizedAssetInput,
  NormalizedMetricInput,
  ProviderAdapter,
  ProviderCredentialDefinition,
} from './providers/provider.types';

type IntegrationRecord = Prisma.IntegrationGetPayload<{
  include: {
    credentialRefs: true;
    syncState: true;
    assets: true;
    currentMetrics: true;
  };
}>;

const providerOrder: IntegrationProvider[] = [
  'proxmox',
  'truenas',
  'unifi',
  'home-assistant',
  'plex',
  'github',
] as const;

const MIN_POLLING_INTERVAL_SECONDS = 15;
const MAX_POLLING_INTERVAL_SECONDS = 900;

@Injectable()
export class IntegrationsService implements OnModuleInit, OnModuleDestroy {
  private readonly adapters = new Map<IntegrationProvider, ProviderAdapter>(
    providerAdapters.map((adapter) => [adapter.provider, adapter] as const),
  );
  private readonly pollTimers = new Map<IntegrationProvider, NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.seedIntegrations();
    await this.syncAll('startup');
    await this.startPolling();
  }

  onModuleDestroy() {
    this.pollTimers.forEach((timer) => clearInterval(timer));
    this.pollTimers.clear();
  }

  async listOverview(): Promise<IntegrationsOverviewResponse> {
    await this.seedIntegrations();

    const integrations = await this.prisma.integration.findMany({
      include: {
        credentialRefs: true,
        syncState: true,
        assets: true,
        currentMetrics: true,
      },
      orderBy: {
        provider: 'asc',
      },
    });

    const summaries = integrations
      .map((integration) => this.toSummary(integration))
      .sort(
        (left, right) =>
          providerOrder.indexOf(left.provider) -
          providerOrder.indexOf(right.provider),
      );

    return {
      generatedAt: new Date().toISOString(),
      totals: {
        providers: summaries.length,
        healthyProviders: summaries.filter(
          (integration) => integration.status === 'healthy',
        ).length,
        degradedProviders: summaries.filter(
          (integration) =>
            integration.status === 'degraded' || integration.status === 'error',
        ).length,
        assets: summaries.reduce(
          (sum, integration) =>
            sum +
            integration.assetsByType.reduce(
              (assetSum, assetType) => assetSum + assetType.total,
              0,
            ),
          0,
        ),
        metrics: integrations.reduce(
          (sum, integration) => sum + integration.currentMetrics.length,
          0,
        ),
      },
      integrations: summaries,
    };
  }

  async getIntegration(provider: string): Promise<IntegrationDetailResponse> {
    await this.seedIntegrations();
    const integration = await this.findIntegration(provider);
    const adapter = this.getAdapter(integration.provider as IntegrationProvider);

    return {
      integration: this.toSummary(integration),
      credentials: integration.credentialRefs.map((credential) =>
        this.toCredentialRef(credential, adapter.credentials),
      ),
      actions: adapter.actions,
      assets: integration.assets
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((asset) => this.toAsset(asset)),
      metrics: integration.currentMetrics
        .slice()
        .sort((left, right) => left.label.localeCompare(right.label))
        .map((metric) =>
          this.toMetric(metric, integration.provider as IntegrationProvider),
        ),
    };
  }

  async updateConfiguration(
    provider: string,
    updates: UpdateIntegrationConfigurationRequest,
  ): Promise<IntegrationDetailResponse> {
    await this.seedIntegrations();

    const integration = await this.findIntegration(provider);
    const typedProvider = integration.provider as IntegrationProvider;
    const adapter = this.getAdapter(typedProvider);
    const editableCredentials = new Map(
      adapter.credentials
        .filter((credential) => !credential.sensitive)
        .map((credential) => [credential.key, credential] as const),
    );

    const integrationUpdate: {
      enabled?: boolean;
      pollingIntervalSeconds?: number | null;
      status?: string;
    } = {};

    if (updates.enabled !== undefined) {
      if (typeof updates.enabled !== 'boolean') {
        throw new BadRequestException('enabled must be a boolean value.');
      }

      integrationUpdate.enabled = updates.enabled;
      integrationUpdate.status = updates.enabled ? 'pending' : 'disabled';
    }

    if (updates.pollingIntervalSeconds !== undefined) {
      integrationUpdate.pollingIntervalSeconds =
        this.validatePollingInterval(updates.pollingIntervalSeconds);
    }

    if (Object.keys(integrationUpdate).length > 0) {
      await this.prisma.integration.update({
        where: { provider: typedProvider },
        data: integrationUpdate,
      });
    }

    if (updates.credentialValues) {
      await Promise.all(
        Object.entries(updates.credentialValues).map(([key, rawValue]) => {
          const definition = editableCredentials.get(key);

          if (!definition) {
            throw new BadRequestException(
              `${key} cannot be edited in-app for ${adapter.displayName}.`,
            );
          }

          const value = rawValue.trim();

          return this.prisma.integrationCredentialRef.upsert({
            where: {
              integrationId_key: {
                integrationId: integration.id,
                key,
              },
            },
            create: {
              integrationId: integration.id,
              key,
              label: definition.label,
              value: value.length > 0 ? value : `env:${definition.envVar}`,
              sensitive: false,
            },
            update: {
              label: definition.label,
              value: value.length > 0 ? value : `env:${definition.envVar}`,
              sensitive: false,
            },
          });
        }),
      );
    }

    await this.prisma.integrationSyncState.upsert({
      where: { integrationId: integration.id },
      create: {
        integrationId: integration.id,
        status: integrationUpdate.enabled === false ? 'disabled' : 'pending',
      },
      update:
        integrationUpdate.enabled === false
          ? {
              status: 'disabled',
            }
          : {},
    });

    await this.startPolling();

    this.notificationsService.record({
      title: `${adapter.displayName} settings saved`,
      message: `${adapter.displayName} is ${
        integrationUpdate.enabled === false ? 'disabled' : 'ready to sync'
      }.`,
      severity: 'info',
      source: 'integration',
    });

    return this.getIntegration(typedProvider);
  }

  async syncAll(
    reason: 'manual' | 'schedule' | 'startup' = 'manual',
  ): Promise<IntegrationsOverviewResponse> {
    await this.seedIntegrations();

    for (const provider of providerOrder) {
      try {
        await this.syncProvider(provider, reason);
      } catch {
        continue;
      }
    }

    return this.listOverview();
  }

  async syncProvider(
    provider: string,
    reason: 'manual' | 'schedule' | 'startup' = 'manual',
  ): Promise<IntegrationDetailResponse> {
    await this.seedIntegrations();

    const integration = await this.findIntegration(provider);
    const typedProvider = integration.provider as IntegrationProvider;
    const adapter = this.getAdapter(typedProvider);

    if (!integration.enabled) {
      await this.prisma.integration.update({
        where: { provider: typedProvider },
        data: { status: 'disabled' },
      });

      await this.prisma.integrationSyncState.upsert({
        where: { integrationId: integration.id },
        create: {
          integrationId: integration.id,
          status: 'disabled',
        },
        update: {
          status: 'disabled',
        },
      });

      return this.getIntegration(typedProvider);
    }

    const startedAt = new Date();
    const previousFailures = integration.syncState?.consecutiveFailures ?? 0;

    await this.prisma.integration.update({
      where: { provider: typedProvider },
      data: { status: 'syncing' },
    });

    await this.prisma.integrationSyncState.upsert({
      where: { integrationId: integration.id },
      create: {
        integrationId: integration.id,
        status: 'syncing',
        lastStartedAt: startedAt,
        lastError: null,
        consecutiveFailures: previousFailures,
      },
      update: {
        status: 'syncing',
        lastStartedAt: startedAt,
        lastError: null,
      },
    });

    try {
      const result = await adapter.sync({
        now: startedAt,
        credentials: this.resolveCredentialValues(
          adapter.credentials,
          integration.credentialRefs,
        ),
      });

      const assetPersistence = await this.persistAssets(
        integration.id,
        typedProvider,
        result.assets,
        startedAt,
      );
      const metricPersistence = await this.persistMetrics(
        integration.id,
        typedProvider,
        result.metrics,
        assetPersistence.assetIdsByReference,
        startedAt,
      );

      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await this.prisma.integration.update({
        where: { provider: typedProvider },
        data: { status: result.status },
      });

      await this.prisma.integrationSyncState.upsert({
        where: { integrationId: integration.id },
        create: {
          integrationId: integration.id,
          status: result.status,
          lastStartedAt: startedAt,
          lastCompletedAt: completedAt,
          lastSuccessAt: completedAt,
          lastError: null,
          consecutiveFailures: 0,
          durationMs,
          assetCount: assetPersistence.totalCount,
          metricCount: metricPersistence.totalCount,
          summaryJson: JSON.stringify({
            headline: result.headline,
            highlights: result.highlights,
          }),
        },
        update: {
          status: result.status,
          lastStartedAt: startedAt,
          lastCompletedAt: completedAt,
          lastSuccessAt: completedAt,
          lastError: null,
          consecutiveFailures: 0,
          durationMs,
          assetCount: assetPersistence.totalCount,
          metricCount: metricPersistence.totalCount,
          summaryJson: JSON.stringify({
            headline: result.headline,
            highlights: result.highlights,
          }),
        },
      });

      this.realtimeService.broadcast('integration.synced', {
        provider: typedProvider,
        status: result.status,
        assetCount: assetPersistence.totalCount,
        metricCount: metricPersistence.totalCount,
        syncedAt: completedAt.toISOString(),
      });
      this.realtimeService.broadcast('assets.updated', {
        provider: typedProvider,
        changedAssets: assetPersistence.changedCount,
        totalAssets: assetPersistence.totalCount,
      });
      this.realtimeService.broadcast('metrics.updated', {
        provider: typedProvider,
        changedMetrics: metricPersistence.changedCount,
        totalMetrics: metricPersistence.totalCount,
      });

      if (result.status === 'degraded') {
        this.notificationsService.record({
          title: `${adapter.displayName} needs attention`,
          message: result.headline,
          severity: 'warning',
          source: 'integration',
        });
      } else if (reason === 'manual') {
        this.notificationsService.record({
          title: `${adapter.displayName} sync complete`,
          message: result.headline,
          severity: 'success',
          source: 'integration',
        });
      }

      return this.getIntegration(typedProvider);
    } catch (error) {
      const completedAt = new Date();
      const message =
        error instanceof Error
          ? error.message
          : `${adapter.displayName} sync failed.`;

      await this.prisma.integration.update({
        where: { provider: typedProvider },
        data: { status: 'error' },
      });

      await this.prisma.integrationSyncState.upsert({
        where: { integrationId: integration.id },
        create: {
          integrationId: integration.id,
          status: 'error',
          lastStartedAt: startedAt,
          lastCompletedAt: completedAt,
          lastError: message,
          consecutiveFailures: previousFailures + 1,
          assetCount: integration.syncState?.assetCount ?? 0,
          metricCount: integration.syncState?.metricCount ?? 0,
        },
        update: {
          status: 'error',
          lastStartedAt: startedAt,
          lastCompletedAt: completedAt,
          lastError: message,
          consecutiveFailures: previousFailures + 1,
        },
      });

      this.realtimeService.broadcast('integration.sync_failed', {
        provider: typedProvider,
        status: 'error',
        assetCount: integration.syncState?.assetCount ?? 0,
        metricCount: integration.syncState?.metricCount ?? 0,
        syncedAt: completedAt.toISOString(),
        error: message,
      });

      this.notificationsService.record({
        title: `${adapter.displayName} sync failed`,
        message,
        severity: 'error',
        source: 'integration',
      });

      throw error;
    }
  }

  private async seedIntegrations() {
    for (const adapter of providerAdapters) {
      const integration = await this.prisma.integration.upsert({
        where: { provider: adapter.provider },
        create: {
          provider: adapter.provider,
          displayName: adapter.displayName,
          enabled: true,
          status: 'pending',
        },
        update: {
          displayName: adapter.displayName,
        },
      });

      await this.prisma.integrationSyncState.upsert({
        where: { integrationId: integration.id },
        create: {
          integrationId: integration.id,
          status: integration.enabled ? 'pending' : 'disabled',
        },
        update: {},
      });

      for (const credential of adapter.credentials) {
        await this.prisma.integrationCredentialRef.upsert({
          where: {
            integrationId_key: {
              integrationId: integration.id,
              key: credential.key,
            },
          },
          create: {
            integrationId: integration.id,
            key: credential.key,
            label: credential.label,
            value: `env:${credential.envVar}`,
            sensitive: credential.sensitive,
          },
          update: {
            label: credential.label,
            sensitive: credential.sensitive,
          },
        });
      }
    }
  }

  private async startPolling() {
    this.pollTimers.forEach((timer) => clearInterval(timer));
    this.pollTimers.clear();

    const integrations = await this.prisma.integration.findMany({
      select: {
        provider: true,
        enabled: true,
        pollingIntervalSeconds: true,
      },
    });
    const integrationByProvider = new Map(
      integrations.map((integration) => [integration.provider, integration] as const),
    );

    providerAdapters.forEach((adapter) => {
      const integration = integrationByProvider.get(adapter.provider);

      if (integration && !integration.enabled) {
        return;
      }

      const intervalSeconds = this.resolvePollingInterval(
        integration?.pollingIntervalSeconds ?? null,
        adapter.syncIntervalSeconds,
      );
      const timer = setInterval(() => {
        void this.syncProvider(adapter.provider, 'schedule');
      }, intervalSeconds * 1000);

      this.pollTimers.set(adapter.provider, timer);
    });
  }

  private async findIntegration(provider: string): Promise<IntegrationRecord> {
    const normalizedProvider = this.ensureProvider(provider);

    return this.prisma.integration.findUniqueOrThrow({
      where: {
        provider: normalizedProvider,
      },
      include: {
        credentialRefs: true,
        syncState: true,
        assets: true,
        currentMetrics: true,
      },
    });
  }

  private getAdapter(provider: IntegrationProvider) {
    const adapter = this.adapters.get(provider);

    if (!adapter) {
      throw new NotFoundException(`No adapter registered for ${provider}`);
    }

    return adapter;
  }

  private ensureProvider(provider: string): IntegrationProvider {
    if (
      provider === 'proxmox' ||
      provider === 'truenas' ||
      provider === 'unifi' ||
      provider === 'home-assistant' ||
      provider === 'plex' ||
      provider === 'github'
    ) {
      return provider;
    }

    throw new NotFoundException(`Unsupported integration provider: ${provider}`);
  }

  private resolveCredentialValues(
    definitions: ProviderCredentialDefinition[],
    storedRefs: Array<{ key: string; value: string }>,
  ) {
    const valueByKey = new Map(storedRefs.map((ref) => [ref.key, ref.value]));

    return Object.fromEntries(
      definitions.map((definition) => [
        definition.key,
        this.resolveCredentialValue(
          valueByKey.get(definition.key) ?? `env:${definition.envVar}`,
        ),
      ]),
    );
  }

  private resolveCredentialValue(value: string) {
    if (value.startsWith('env:')) {
      return process.env[value.slice(4)];
    }

    return value;
  }

  private async persistAssets(
    integrationId: string,
    provider: IntegrationProvider,
    assets: NormalizedAssetInput[],
    seenAt: Date,
  ) {
    const existingAssets = await this.prisma.asset.findMany({
      where: { integrationId },
    });
    const existingByKey = new Map(
      existingAssets.map((asset) => [
        this.assetReferenceKey({
          assetType: asset.assetType,
          externalId: asset.externalId,
        }),
        asset,
      ]),
    );
    const nextKeys = new Set<string>();
    const assetIdsByReference = new Map<string, string>();
    let changedCount = 0;

    for (const asset of assets) {
      const key = this.assetReferenceKey(asset);
      const metadataJson = this.serializeJson(asset.metadata ?? {});
      const existing = existingByKey.get(key);

      if (
        !existing ||
        existing.name !== asset.name ||
        existing.status !== asset.status ||
        existing.summary !== asset.summary ||
        existing.metadataJson !== metadataJson
      ) {
        changedCount += 1;
      }

      const savedAsset = await this.prisma.asset.upsert({
        where: {
          provider_assetType_externalId: {
            provider,
            assetType: asset.assetType,
            externalId: asset.externalId,
          },
        },
        create: {
          integrationId,
          provider,
          assetType: asset.assetType,
          externalId: asset.externalId,
          name: asset.name,
          status: asset.status,
          summary: asset.summary,
          metadataJson,
          lastSeenAt: seenAt,
        },
        update: {
          integrationId,
          name: asset.name,
          status: asset.status,
          summary: asset.summary,
          metadataJson,
          lastSeenAt: seenAt,
        },
      });

      nextKeys.add(key);
      assetIdsByReference.set(key, savedAsset.id);
    }

    const staleIds = existingAssets
      .filter(
        (asset) =>
          !nextKeys.has(
            this.assetReferenceKey({
              assetType: asset.assetType,
              externalId: asset.externalId,
            }),
          ),
      )
      .map((asset) => asset.id);

    if (staleIds.length > 0) {
      await this.prisma.asset.deleteMany({
        where: {
          id: {
            in: staleIds,
          },
        },
      });
      changedCount += staleIds.length;
    }

    return {
      assetIdsByReference,
      changedCount,
      totalCount: assets.length,
    };
  }

  private async persistMetrics(
    integrationId: string,
    provider: IntegrationProvider,
    metrics: NormalizedMetricInput[],
    assetIdsByReference: Map<string, string>,
    observedAt: Date,
  ) {
    const existingMetrics = await this.prisma.currentMetric.findMany({
      where: { integrationId },
    });
    const existingByScopeKey = new Map(
      existingMetrics.map((metric) => [metric.scopeKey, metric]),
    );
    const nextScopeKeys = new Set<string>();
    let changedCount = 0;

    for (const metric of metrics) {
      const assetId = metric.assetRef
        ? assetIdsByReference.get(this.assetReferenceKey(metric.assetRef)) ?? null
        : null;
      const scopeKey = this.metricScopeKey(provider, metric.key, metric.assetRef);
      const metadataJson = this.serializeJson(metric.metadata ?? {});
      const existing = existingByScopeKey.get(scopeKey);

      if (
        !existing ||
        existing.assetId !== assetId ||
        existing.label !== metric.label ||
        existing.unit !== (metric.unit ?? null) ||
        existing.valueText !== metric.valueText ||
        existing.valueNumber !== (metric.valueNumber ?? null) ||
        existing.status !== metric.status ||
        existing.metadataJson !== metadataJson
      ) {
        changedCount += 1;
      }

      await this.prisma.currentMetric.upsert({
        where: { scopeKey },
        create: {
          integrationId,
          assetId,
          scopeKey,
          key: metric.key,
          label: metric.label,
          unit: metric.unit,
          valueText: metric.valueText,
          valueNumber: metric.valueNumber,
          status: metric.status,
          metadataJson,
          observedAt,
        },
        update: {
          integrationId,
          assetId,
          key: metric.key,
          label: metric.label,
          unit: metric.unit,
          valueText: metric.valueText,
          valueNumber: metric.valueNumber,
          status: metric.status,
          metadataJson,
          observedAt,
        },
      });

      nextScopeKeys.add(scopeKey);
    }

    const staleScopeKeys = existingMetrics
      .filter((metric) => !nextScopeKeys.has(metric.scopeKey))
      .map((metric) => metric.scopeKey);

    if (staleScopeKeys.length > 0) {
      await this.prisma.currentMetric.deleteMany({
        where: {
          scopeKey: {
            in: staleScopeKeys,
          },
        },
      });
      changedCount += staleScopeKeys.length;
    }

    return {
      changedCount,
      totalCount: metrics.length,
    };
  }

  private toSummary(integration: IntegrationRecord): IntegrationSummary {
    const adapter = this.getAdapter(integration.provider as IntegrationProvider);
    const summary = this.parseJson(integration.syncState?.summaryJson) as
      | { headline?: string; highlights?: string[] }
      | undefined;

    return {
      provider: integration.provider as IntegrationProvider,
      displayName: integration.displayName,
      enabled: integration.enabled,
      status: (integration.syncState?.status ??
        integration.status) as IntegrationStatus,
      pollingIntervalSeconds: this.resolvePollingInterval(
        integration.pollingIntervalSeconds,
        adapter.syncIntervalSeconds,
      ),
      headline:
        summary?.headline ??
        `${integration.assets.length} assets and ${integration.currentMetrics.length} metrics normalized.`,
      highlights:
        summary?.highlights ??
        integration.assets
          .slice(0, 3)
          .map((asset) => `${asset.name}: ${asset.summary}`),
      syncState: {
        status: (integration.syncState?.status ??
          integration.status) as IntegrationStatus,
        lastStartedAt: integration.syncState?.lastStartedAt?.toISOString() ?? null,
        lastCompletedAt:
          integration.syncState?.lastCompletedAt?.toISOString() ?? null,
        lastSuccessAt: integration.syncState?.lastSuccessAt?.toISOString() ?? null,
        lastError: integration.syncState?.lastError ?? null,
        consecutiveFailures: integration.syncState?.consecutiveFailures ?? 0,
        durationMs: integration.syncState?.durationMs ?? null,
        assetCount:
          integration.syncState?.assetCount ?? integration.assets.length,
        metricCount:
          integration.syncState?.metricCount ?? integration.currentMetrics.length,
      },
      assetsByType: this.summarizeAssetTypes(integration.assets),
    };
  }

  private summarizeAssetTypes(
    assets: Array<{ assetType: string; status: string }>,
  ): AssetTypeSummary[] {
    const summary = new Map<string, AssetTypeSummary>();

    assets.forEach((asset) => {
      const entry = summary.get(asset.assetType) ?? {
        type: asset.assetType,
        total: 0,
        online: 0,
        warning: 0,
        offline: 0,
        unknown: 0,
      };

      entry.total += 1;

      if (asset.status === 'online') {
        entry.online += 1;
      } else if (asset.status === 'warning') {
        entry.warning += 1;
      } else if (asset.status === 'offline') {
        entry.offline += 1;
      } else {
        entry.unknown += 1;
      }

      summary.set(asset.assetType, entry);
    });

    return [...summary.values()].sort((left, right) =>
      left.type.localeCompare(right.type),
    );
  }

  private toCredentialRef(credential: {
    key: string;
    label: string;
    value: string;
    sensitive: boolean;
  }, definitions: ProviderCredentialDefinition[]): IntegrationCredentialRef {
    const definition = definitions.find((item) => item.key === credential.key);
    const source = this.credentialValueSource(credential.value);

    return {
      key: credential.key,
      label: credential.label,
      value: source === 'stored' ? credential.value : '',
      envVar: definition?.envVar ?? '',
      sensitive: credential.sensitive,
      editable: Boolean(definition && !definition.sensitive),
      configured: Boolean(this.resolveCredentialValue(credential.value)),
      source,
    };
  }

  private validatePollingInterval(value: unknown) {
    if (!Number.isInteger(value)) {
      throw new BadRequestException(
        'pollingIntervalSeconds must be an integer value.',
      );
    }

    if (
      (value as number) < MIN_POLLING_INTERVAL_SECONDS ||
      (value as number) > MAX_POLLING_INTERVAL_SECONDS
    ) {
      throw new BadRequestException(
        `pollingIntervalSeconds must stay between ${MIN_POLLING_INTERVAL_SECONDS} and ${MAX_POLLING_INTERVAL_SECONDS}.`,
      );
    }

    return value as number;
  }

  private resolvePollingInterval(
    override: number | null | undefined,
    fallback: number,
  ) {
    if (!override) {
      return fallback;
    }

    return Math.min(
      Math.max(override, MIN_POLLING_INTERVAL_SECONDS),
      MAX_POLLING_INTERVAL_SECONDS,
    );
  }

  private credentialValueSource(value: string) {
    if (value.trim().length === 0) {
      return 'missing' as const;
    }

    if (value.startsWith('env:')) {
      return 'environment' as const;
    }

    return 'stored' as const;
  }

  private toAsset(asset: {
    id: string;
    provider: string;
    assetType: string;
    externalId: string;
    name: string;
    status: string;
    summary: string;
    metadataJson: string | null;
    lastSeenAt: Date;
  }): IntegrationAsset {
    return {
      id: asset.id,
      provider: asset.provider as IntegrationProvider,
      assetType: asset.assetType,
      externalId: asset.externalId,
      name: asset.name,
      status: asset.status as IntegrationAsset['status'],
      summary: asset.summary,
      metadata: this.parseJson(asset.metadataJson),
      lastSeenAt: asset.lastSeenAt.toISOString(),
    };
  }

  private toMetric(metric: {
    id: string;
    assetId: string | null;
    scopeKey: string;
    key: string;
    label: string;
    unit: string | null;
    valueText: string;
    valueNumber: number | null;
    status: string;
    metadataJson: string | null;
    observedAt: Date;
  }, provider: IntegrationProvider): CurrentMetricSnapshot {
    return {
      id: metric.id,
      provider,
      assetId: metric.assetId,
      scopeKey: metric.scopeKey,
      key: metric.key,
      label: metric.label,
      unit: metric.unit,
      valueText: metric.valueText,
      valueNumber: metric.valueNumber,
      status: metric.status as CurrentMetricSnapshot['status'],
      metadata: this.parseJson(metric.metadataJson),
      observedAt: metric.observedAt.toISOString(),
    };
  }

  private metricScopeKey(
    provider: IntegrationProvider,
    key: string,
    assetRef?: AssetReference,
  ) {
    if (!assetRef) {
      return `${provider}:global:${key}`;
    }

    return `${provider}:${assetRef.assetType}:${assetRef.externalId}:${key}`;
  }

  private assetReferenceKey(reference: AssetReference) {
    return `${reference.assetType}:${reference.externalId}`;
  }

  private serializeJson(value: JsonValue) {
    return JSON.stringify(value);
  }

  private parseJson(value: string | null | undefined): JsonObject {
    if (!value) {
      return {};
    }

    try {
      const parsed = JSON.parse(value) as JsonValue;

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return {};
    }

    return {};
  }
}
