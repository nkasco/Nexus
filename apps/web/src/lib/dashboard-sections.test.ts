import type {
  DashboardResponse,
  HealthResponse,
  IntegrationsOverviewResponse,
} from '@nexus/shared';
import { buildWidgetViews } from './dashboard-sections';

describe('buildWidgetViews', () => {
  it('hydrates overview widgets from the integration summary', () => {
    const dashboard: DashboardResponse = {
      slug: 'overview',
      name: 'Overview',
      updatedAt: '2026-03-21T18:00:00.000Z',
      layout: {
        preset: 'balanced',
        widgets: [
          {
            id: 'overview-health',
            title: 'Fleet Health',
            columnSpan: 2,
            rowSpan: 1,
          },
          {
            id: 'overview-feed',
            title: 'Operator Feed',
            columnSpan: 1,
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
        assets: 9,
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
            assetCount: 4,
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

    const widgets = buildWidgetViews(dashboard, health, integrations);

    expect(widgets[0]).toMatchObject({
      metric: '1/2 healthy',
      state: 'ready',
    });
    expect(widgets[0]?.lines).toContain(
      'Proxmox: 2 nodes, 4 guests, quorum intact.',
    );
    expect(widgets[1]?.state).toBe('ready');
    expect(widgets[1]?.lines?.[0]).toContain('Proxmox synced');
  });
});
