import type {
  DashboardResponse,
  HealthResponse,
  IntegrationDetailResponse,
  IntegrationsOverviewResponse,
} from '@nexus/shared';
import { buildWidgetViews } from './dashboard-sections';

describe('buildWidgetViews', () => {
  it('builds phase 3 overview widgets from integration details', () => {
    const dashboard: DashboardResponse = {
      slug: 'overview',
      name: 'Overview',
      updatedAt: '2026-03-21T18:00:00.000Z',
      layout: {
        preset: 'balanced',
        widgets: [
          {
            id: 'overview-compute',
            title: 'Compute Status',
            columnSpan: 1,
            rowSpan: 1,
          },
          {
            id: 'overview-alerts',
            title: 'Attention Summary',
            columnSpan: 2,
            rowSpan: 1,
            settings: {
              focus: 'attention',
            },
          },
          {
            id: 'overview-feed',
            title: 'Recent Activity',
            columnSpan: 2,
            rowSpan: 1,
          },
        ],
      },
    };

    const health: HealthResponse = {
      service: 'nexus-api',
      status: 'ok',
      timestamp: '2026-03-21T18:05:00.000Z',
      uptimeSeconds: 120,
      components: [],
    };

    const integrations: IntegrationsOverviewResponse = {
      generatedAt: '2026-03-21T18:05:00.000Z',
      totals: {
        providers: 2,
        healthyProviders: 1,
        degradedProviders: 1,
        assets: 10,
        metrics: 7,
      },
      integrations: [
        {
          provider: 'proxmox',
          displayName: 'Proxmox',
          enabled: true,
          status: 'healthy',
          pollingIntervalSeconds: 60,
          headline: '2 nodes, 4 guests, quorum intact.',
          highlights: ['Cluster quorum healthy across both nodes.'],
          syncState: {
            status: 'healthy',
            lastStartedAt: '2026-03-21T18:04:00.000Z',
            lastCompletedAt: '2026-03-21T18:05:00.000Z',
            lastSuccessAt: '2026-03-21T18:05:00.000Z',
            lastError: null,
            consecutiveFailures: 0,
            durationMs: 820,
            assetCount: 5,
            metricCount: 4,
          },
          assetsByType: [
            {
              type: 'node',
              total: 2,
              online: 2,
              warning: 0,
              offline: 0,
              unknown: 0,
            },
          ],
        },
        {
          provider: 'plex',
          displayName: 'Plex',
          enabled: true,
          status: 'degraded',
          pollingIntervalSeconds: 60,
          headline:
            'Server reachable with 2 active streams and one transcode in flight.',
          highlights: ['One stream is currently transcoding.'],
          syncState: {
            status: 'degraded',
            lastStartedAt: '2026-03-21T18:03:30.000Z',
            lastCompletedAt: '2026-03-21T18:04:30.000Z',
            lastSuccessAt: '2026-03-21T18:04:30.000Z',
            lastError: null,
            consecutiveFailures: 0,
            durationMs: 1100,
            assetCount: 5,
            metricCount: 3,
          },
          assetsByType: [
            {
              type: 'session',
              total: 2,
              online: 1,
              warning: 1,
              offline: 0,
              unknown: 0,
            },
          ],
        },
      ],
    };

    const proxmoxDetail: IntegrationDetailResponse = {
      integration: integrations.integrations[0]!,
      credentials: [],
      actions: [],
      assets: [
        {
          id: 'cluster-1',
          provider: 'proxmox',
          assetType: 'cluster',
          externalId: 'pve-cluster',
          name: 'Homelab Cluster',
          status: 'online',
          summary: 'Quorum stable and replication online.',
          metadata: { nodes: 2, guests: 4 },
          lastSeenAt: '2026-03-21T18:05:00.000Z',
        },
        {
          id: 'node-1',
          provider: 'proxmox',
          assetType: 'node',
          externalId: 'pve-01',
          name: 'pve-01',
          status: 'online',
          summary: 'CPU 38%, memory 62%, local storage 58% used.',
          metadata: { cpuPercent: 38, memoryPercent: 62, storagePercent: 58 },
          lastSeenAt: '2026-03-21T18:05:00.000Z',
        },
        {
          id: 'node-2',
          provider: 'proxmox',
          assetType: 'node',
          externalId: 'pve-02',
          name: 'pve-02',
          status: 'online',
          summary: 'CPU 24%, memory 48%, replication standby ready.',
          metadata: { cpuPercent: 24, memoryPercent: 48, storagePercent: 44 },
          lastSeenAt: '2026-03-21T18:05:00.000Z',
        },
        {
          id: 'vm-1',
          provider: 'proxmox',
          assetType: 'vm',
          externalId: 'vm-120',
          name: 'plex-core',
          status: 'online',
          summary: 'Media VM online with guest agent responding.',
          metadata: { node: 'pve-01', powerState: 'running' },
          lastSeenAt: '2026-03-21T18:05:00.000Z',
        },
        {
          id: 'lxc-1',
          provider: 'proxmox',
          assetType: 'lxc',
          externalId: 'lxc-221',
          name: 'automation-edge',
          status: 'warning',
          summary: 'Guest agent reconnecting after routine package updates.',
          metadata: { node: 'pve-02', powerState: 'running' },
          lastSeenAt: '2026-03-21T18:05:00.000Z',
        },
      ],
      metrics: [
        {
          id: 'metric-1',
          provider: 'proxmox',
          assetId: null,
          scopeKey: 'proxmox:cluster.quorum',
          key: 'cluster.quorum',
          label: 'Cluster Quorum',
          unit: null,
          valueText: 'Healthy',
          valueNumber: null,
          status: 'normal',
          metadata: {},
          observedAt: '2026-03-21T18:05:00.000Z',
        },
      ],
    };

    const plexDetail: IntegrationDetailResponse = {
      integration: integrations.integrations[1]!,
      credentials: [],
      actions: [],
      assets: [
        {
          id: 'server-1',
          provider: 'plex',
          assetType: 'server',
          externalId: 'plex-main',
          name: 'Plex Main',
          status: 'warning',
          summary: 'Server online with elevated transcode activity.',
          metadata: { activeStreams: 2, transcodes: 1 },
          lastSeenAt: '2026-03-21T18:04:30.000Z',
        },
        {
          id: 'session-1',
          provider: 'plex',
          assetType: 'session',
          externalId: 'session-1001',
          name: 'Living Room Stream',
          status: 'online',
          summary: 'Direct play session active in the living room.',
          metadata: { mode: 'direct-play' },
          lastSeenAt: '2026-03-21T18:04:30.000Z',
        },
        {
          id: 'session-2',
          provider: 'plex',
          assetType: 'session',
          externalId: 'session-1002',
          name: 'Tablet Stream',
          status: 'warning',
          summary: 'Remote stream is transcoding to a lower bitrate.',
          metadata: { mode: 'transcode' },
          lastSeenAt: '2026-03-21T18:04:30.000Z',
        },
      ],
      metrics: [
        {
          id: 'metric-plex-1',
          provider: 'plex',
          assetId: null,
          scopeKey: 'plex:streams.transcode',
          key: 'streams.transcode',
          label: 'Transcodes',
          unit: null,
          valueText: '1',
          valueNumber: 1,
          status: 'warning',
          metadata: {},
          observedAt: '2026-03-21T18:04:30.000Z',
        },
      ],
    };

    const widgets = buildWidgetViews(dashboard, health, integrations, {
      proxmox: proxmoxDetail,
      plex: plexDetail,
    });

    expect(widgets[0]).toMatchObject({
      id: 'overview-compute',
      metric: '2 nodes',
      state: 'ready',
      refreshScope: 'proxmox',
      navigationTarget: 'home-lab',
    });
    expect(widgets[0]?.stats?.[0]?.value).toBe('2');
    expect(widgets[1]).toMatchObject({
      id: 'overview-alerts',
      metric: '4 signals',
      tone: 'warning',
      focus: 'attention',
      refreshScope: 'all',
    });
    expect(
      widgets[1]?.items?.some((item) => item.label.includes('Plex')),
    ).toBe(true);
    expect(widgets[2]?.items?.[0]?.label).toBe('nexus-api heartbeat');
  });
});
