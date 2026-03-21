import type { Prisma } from '@prisma/client';
import { IntegrationsService } from './integrations.service';

function createIntegrationRecord(
  overrides: Partial<
    Prisma.IntegrationGetPayload<{
      include: {
        credentialRefs: true;
        syncState: true;
        assets: true;
        currentMetrics: true;
      };
    }>
  > = {},
): Prisma.IntegrationGetPayload<{
  include: {
    credentialRefs: true;
    syncState: true;
    assets: true;
    currentMetrics: true;
  };
}> {
  return {
    id: 'integration-1',
    provider: 'proxmox',
    displayName: 'Proxmox',
    enabled: true,
    status: 'pending',
    createdAt: new Date('2026-03-21T18:00:00.000Z'),
    updatedAt: new Date('2026-03-21T18:00:00.000Z'),
    credentialRefs: [
      {
        id: 'credential-1',
        integrationId: 'integration-1',
        key: 'baseUrl',
        label: 'Cluster API URL',
        value: 'env:PROXMOX_BASE_URL',
        sensitive: false,
        createdAt: new Date('2026-03-21T18:00:00.000Z'),
        updatedAt: new Date('2026-03-21T18:00:00.000Z'),
      },
    ],
    syncState: {
      id: 'sync-1',
      integrationId: 'integration-1',
      status: 'pending',
      lastStartedAt: null,
      lastCompletedAt: null,
      lastSuccessAt: null,
      lastError: null,
      consecutiveFailures: 0,
      durationMs: null,
      assetCount: 0,
      metricCount: 0,
      summaryJson: null,
      createdAt: new Date('2026-03-21T18:00:00.000Z'),
      updatedAt: new Date('2026-03-21T18:00:00.000Z'),
    },
    assets: [],
    currentMetrics: [],
    ...overrides,
  };
}

describe('IntegrationsService', () => {
  it('syncs a provider snapshot, persists normalized records, and broadcasts updates', async () => {
    const finalIntegrationRecord = createIntegrationRecord({
      status: 'healthy',
      assets: [
        {
          id: 'asset-node-1',
          integrationId: 'integration-1',
          provider: 'proxmox',
          assetType: 'node',
          externalId: 'pve-01',
          name: 'pve-01',
          status: 'online',
          summary: 'CPU 38%, memory 62%, local storage 58% used.',
          metadataJson: '{"cpuPercent":38}',
          lastSeenAt: new Date('2026-03-21T18:05:00.000Z'),
          createdAt: new Date('2026-03-21T18:05:00.000Z'),
          updatedAt: new Date('2026-03-21T18:05:00.000Z'),
        },
      ],
      currentMetrics: [
        {
          id: 'metric-node-cpu',
          integrationId: 'integration-1',
          assetId: 'asset-node-1',
          scopeKey: 'proxmox:node:pve-01:node.cpu',
          key: 'node.cpu',
          label: 'Node CPU',
          unit: '%',
          valueText: '38%',
          valueNumber: 38,
          status: 'normal',
          metadataJson: '{}',
          observedAt: new Date('2026-03-21T18:05:00.000Z'),
          createdAt: new Date('2026-03-21T18:05:00.000Z'),
          updatedAt: new Date('2026-03-21T18:05:00.000Z'),
        },
      ],
      syncState: {
        id: 'sync-1',
        integrationId: 'integration-1',
        status: 'healthy',
        lastStartedAt: new Date('2026-03-21T18:05:00.000Z'),
        lastCompletedAt: new Date('2026-03-21T18:05:01.000Z'),
        lastSuccessAt: new Date('2026-03-21T18:05:01.000Z'),
        lastError: null,
        consecutiveFailures: 0,
        durationMs: 1000,
        assetCount: 5,
        metricCount: 4,
        summaryJson: JSON.stringify({
          headline: '2 nodes, 4 guests, quorum intact.',
          highlights: ['Cluster quorum healthy across both nodes.'],
        }),
        createdAt: new Date('2026-03-21T18:00:00.000Z'),
        updatedAt: new Date('2026-03-21T18:05:01.000Z'),
      },
    });

    const prisma = {
      integration: {
        upsert: vi.fn().mockResolvedValue({
          id: 'integration-1',
          enabled: true,
        }),
        update: vi.fn().mockResolvedValue({}),
        findUniqueOrThrow: vi
          .fn()
          .mockResolvedValueOnce(createIntegrationRecord())
          .mockResolvedValueOnce(finalIntegrationRecord),
      },
      integrationSyncState: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      integrationCredentialRef: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      asset: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi
          .fn()
          .mockImplementation(
            ({
              create,
            }: {
              create: { assetType: string; externalId: string };
            }) =>
              Promise.resolve({
                id: `${create.assetType}-${create.externalId}`,
                ...create,
              }),
          ),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      currentMetric: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const realtimeService = {
      broadcast: vi.fn(),
    };
    const notificationsService = {
      record: vi.fn(),
    };

    const service = new IntegrationsService(
      prisma as never,
      realtimeService as never,
      notificationsService as never,
    );

    const detail = await service.syncProvider('proxmox', 'manual');

    expect(detail.integration.provider).toBe('proxmox');
    expect(detail.integration.syncState.assetCount).toBe(5);
    expect(prisma.asset.upsert).toHaveBeenCalled();
    expect(prisma.currentMetric.upsert).toHaveBeenCalled();
    expect(realtimeService.broadcast).toHaveBeenCalledWith(
      'integration.synced',
      expect.objectContaining({
        provider: 'proxmox',
        assetCount: 5,
        metricCount: 4,
      }),
    );
    expect(notificationsService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Proxmox sync complete',
        severity: 'success',
        source: 'integration',
      }),
    );
  });
});
