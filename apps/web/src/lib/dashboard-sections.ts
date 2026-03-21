import type {
  DashboardResponse,
  DashboardSlug,
  HealthResponse,
  IntegrationsOverviewResponse,
  IntegrationSummary,
} from '@nexus/shared';

export const dashboardSections: {
  slug: DashboardSlug;
  label: string;
  eyebrow: string;
  description: string;
}[] = [
  {
    slug: 'overview',
    label: 'Overview',
    eyebrow: 'Command deck',
    description:
      'A blended summary of infrastructure, media, and delivery health.',
  },
  {
    slug: 'home-lab',
    label: 'Home Lab',
    eyebrow: 'Infrastructure',
    description: 'Core compute, storage, and network surface for the homelab.',
  },
  {
    slug: 'media',
    label: 'Media',
    eyebrow: 'Playback',
    description:
      'Sessions, library activity, and media-side automation posture.',
  },
  {
    slug: 'devops',
    label: 'DevOps',
    eyebrow: 'Delivery',
    description:
      'Workflows, pull requests, release readiness, and pipeline drift.',
  },
  {
    slug: 'metrics',
    label: 'Metrics',
    eyebrow: 'Signals',
    description: 'Time windows, collection cadence, and future trend surfaces.',
  },
  {
    slug: 'alerts',
    label: 'Alerts',
    eyebrow: 'Awareness',
    description: 'Open issues, routing posture, and response visibility.',
  },
];

type WidgetState = 'ready' | 'loading' | 'empty' | 'error';

export interface WidgetView {
  id: string;
  title: string;
  eyebrow: string;
  detail: string;
  metric?: string;
  state: WidgetState;
  lines?: string[];
  columnSpan: number;
  rowSpan: number;
}

const widgetPresentation: Record<
  string,
  Omit<WidgetView, 'id' | 'title' | 'columnSpan' | 'rowSpan'>
> = {
  'overview-health': {
    eyebrow: 'Fleet snapshot',
    detail:
      'Health summaries are sourced from the backend heartbeat and current shell preferences.',
    metric: '4 domains',
    state: 'ready',
    lines: [
      'Core platform online',
      'Theme and layout persistence active',
      'Realtime transport attached',
    ],
  },
  'overview-feed': {
    eyebrow: 'Operator cadence',
    detail:
      'This feed will become the cross-domain activity stream in Phase 3.',
    metric: '3 recent',
    state: 'loading',
  },
  'overview-capacity': {
    eyebrow: 'Trend posture',
    detail:
      'Historical metrics are not online yet, so this card is holding space for rollups.',
    metric: 'Phase 4',
    state: 'empty',
  },
  'homelab-cluster': {
    eyebrow: 'Compute',
    detail:
      'Current shell connectivity proves the route is live while provider integrations remain ahead.',
    metric: '12 nodes planned',
    state: 'ready',
    lines: [
      'Cluster controls deferred to Phase 6',
      'Provider adapters begin in Phase 2',
      'Layout persistence already available',
    ],
  },
  'homelab-power': {
    eyebrow: 'Thermals',
    detail:
      'Environmental telemetry will hydrate here once the normalized metrics model is active.',
    metric: 'Awaiting sensors',
    state: 'empty',
  },
  'homelab-network': {
    eyebrow: 'Edge',
    detail:
      'Network widgets are scaffolded, but upstream UniFi state is not connected yet.',
    metric: 'Sync blocked',
    state: 'error',
  },
  'media-streams': {
    eyebrow: 'Playback',
    detail:
      'This slot is ready for Plex sessions and server health once the adapter ships.',
    metric: 'No sessions yet',
    state: 'empty',
  },
  'media-libraries': {
    eyebrow: 'Curation',
    detail:
      'The shell can already save widget posture for media operators before data arrives.',
    metric: 'Saved preset',
    state: 'ready',
    lines: [
      'Balanced and compact layouts available',
      'Preferences sync over authenticated API',
    ],
  },
  'media-actions': {
    eyebrow: 'Automation',
    detail:
      'Library scans and safe controls are intentionally deferred to a later phase.',
    metric: 'Phase 6',
    state: 'loading',
  },
  'devops-workflows': {
    eyebrow: 'Pipelines',
    detail:
      'GitHub workflow visibility will connect through the Phase 2 adapter layer.',
    metric: 'CI pending',
    state: 'loading',
  },
  'devops-prs': {
    eyebrow: 'Reviews',
    detail:
      'This queue will surface open pull requests and decision bottlenecks.',
    metric: 'Awaiting GitHub',
    state: 'empty',
  },
  'devops-releases': {
    eyebrow: 'Deployments',
    detail:
      'Release posture is scaffolded but currently reflects platform readiness rather than live repos.',
    metric: 'Shell online',
    state: 'ready',
    lines: ['Authentication gate complete', 'Notification center active'],
  },
  'metrics-window': {
    eyebrow: 'Time ranges',
    detail:
      'Phase 1 establishes the shell affordances that later metrics filters will plug into.',
    metric: '15m default',
    state: 'ready',
    lines: ['Time range selector reserved in the top bar'],
  },
  'metrics-trends': {
    eyebrow: 'Charts',
    detail:
      'ApexCharts is available, but historical rollups are still ahead of us.',
    metric: 'Coming soon',
    state: 'empty',
  },
  'metrics-sources': {
    eyebrow: 'Collectors',
    detail:
      'Realtime heartbeats prove transport; data collection begins in the next phase.',
    metric: '1 active source',
    state: 'ready',
    lines: ['Backend health endpoint', 'WebSocket heartbeat'],
  },
  'alerts-open': {
    eyebrow: 'Incident posture',
    detail:
      'Alerting UI space is in place while rules and deduplication remain future work.',
    metric: 'No rules yet',
    state: 'empty',
  },
  'alerts-routing': {
    eyebrow: 'Destinations',
    detail:
      'Notification center and outbound channel placeholders are ready for Phase 5.',
    metric: 'Discord first',
    state: 'ready',
    lines: ['Discord planned first', 'Telegram and email follow'],
  },
  'alerts-history': {
    eyebrow: 'Timeline',
    detail:
      'Once alerts exist, state transitions and acknowledgements will stack here.',
    metric: 'Awaiting engine',
    state: 'loading',
  },
};

export function isDashboardSlug(value: string): value is DashboardSlug {
  return dashboardSections.some((section) => section.slug === value);
}

export function getSectionMeta(slug: DashboardSlug) {
  return (
    dashboardSections.find((section) => section.slug === slug) ??
    dashboardSections[0]!
  );
}

export function buildWidgetViews(
  dashboard: DashboardResponse,
  health: HealthResponse | null,
  integrations: IntegrationsOverviewResponse | null,
): WidgetView[] {
  return dashboard.layout.widgets.map((widget) => {
    const presentation = widgetPresentation[widget.id];
    const dynamic = buildDynamicWidgetPresentation(
      widget.id,
      health,
      integrations,
    );
    const healthMetric =
      widget.id === 'overview-health' && health
        ? dynamic.metric ?? `${health.status === 'ok' ? 'Healthy' : 'Degraded'}`
        : dynamic.metric ?? presentation?.metric;

    return {
      id: widget.id,
      title: widget.title,
      eyebrow: dynamic.eyebrow ?? presentation?.eyebrow ?? 'Widget',
      detail:
        dynamic.detail ??
        presentation?.detail ??
        'This widget will be wired to a future backend surface.',
      metric: healthMetric,
      state: dynamic.state ?? presentation?.state ?? 'ready',
      lines: dynamic.lines ?? presentation?.lines,
      columnSpan: widget.columnSpan,
      rowSpan: widget.rowSpan,
    };
  });
}

function buildDynamicWidgetPresentation(
  widgetId: string,
  health: HealthResponse | null,
  integrations: IntegrationsOverviewResponse | null,
): Partial<WidgetView> {
  if (!integrations) {
    return {};
  }

  const proxmox = findIntegration(integrations, 'proxmox');
  const truenas = findIntegration(integrations, 'truenas');
  const unifi = findIntegration(integrations, 'unifi');
  const homeAssistant = findIntegration(integrations, 'home-assistant');
  const plex = findIntegration(integrations, 'plex');
  const github = findIntegration(integrations, 'github');

  switch (widgetId) {
    case 'overview-health':
      return {
        detail: `${integrations.totals.assets} normalized assets and ${integrations.totals.metrics} current metrics are active across the read-only integration layer.`,
        metric: `${integrations.totals.healthyProviders}/${integrations.totals.providers} healthy`,
        state: integrations.integrations.length > 0 ? 'ready' : 'loading',
        lines: integrations.integrations
          .slice(0, 3)
          .map(
            (integration) =>
              `${integration.displayName}: ${integration.headline}`,
          ),
      };
    case 'overview-feed':
      return {
        detail:
          'Recent provider syncs now flow through the normalized Phase 2 ingest pipeline.',
        metric: `${integrations.integrations.length} providers`,
        state: integrations.integrations.length > 0 ? 'ready' : 'loading',
        lines: integrations.integrations
          .slice()
          .sort(compareByLastCompletedAt)
          .slice(0, 3)
          .map(
            (integration) =>
              `${integration.displayName} synced ${formatSyncAge(
                integration.syncState.lastCompletedAt,
              )}`,
          ),
      };
    case 'overview-capacity':
      return {
        detail:
          'Phase 2 stores current-state inventory and metric snapshots in SQLite, ready for historical rollups later.',
        metric: `${integrations.totals.assets} assets`,
        state: 'ready',
        lines: [
          `${integrations.totals.metrics} current metrics retained`,
          `${integrations.totals.degradedProviders} providers need attention`,
          `${health?.status === 'ok' ? 'Backend transport healthy' : 'Backend health is degraded'}`,
        ],
      };
    case 'homelab-cluster':
      return integrationWidget(
        proxmox,
        'Compute',
        'Node, VM, and LXC posture is now sourced from the normalized Proxmox snapshot.',
        typeMetric(proxmox, 'node', 'nodes'),
      );
    case 'homelab-power':
      return integrationWidget(
        truenas,
        'Storage',
        'Pool and disk health now come from the TrueNAS read-only snapshot layer.',
        typeMetric(truenas, 'pool', 'pools'),
      );
    case 'homelab-network':
      return integrationWidget(
        unifi,
        'Edge',
        'Gateway, switch, and AP status are now represented through the shared integration model.',
        typeMetric(unifi, 'access-point', 'APs'),
      );
    case 'media-streams':
      return integrationWidget(
        plex,
        'Playback',
        'Active stream posture and server health now arrive through the Plex snapshot adapter.',
        typeMetric(plex, 'session', 'sessions'),
      );
    case 'media-libraries':
      return integrationWidget(
        plex,
        'Libraries',
        'Library and server state are stored as normalized Plex assets for later dashboard expansion.',
        typeMetric(plex, 'library', 'libraries'),
      );
    case 'media-actions':
      return integrationWidget(
        homeAssistant,
        'Automation',
        'Home Assistant entities and automations are read-only in Phase 2 while write controls stay deferred.',
        typeMetric(homeAssistant, 'automation', 'automations'),
      );
    case 'devops-workflows':
      return integrationWidget(
        github,
        'Pipelines',
        'Workflow runs are now normalized through the GitHub adapter for cross-dashboard use.',
        typeMetric(github, 'workflow', 'workflows'),
      );
    case 'devops-prs':
      return integrationWidget(
        github,
        'Reviews',
        'Open pull request state is available through the same read-only GitHub integration model.',
        typeMetric(github, 'pull-request', 'PRs'),
      );
    case 'devops-releases':
      return integrationWidget(
        github,
        'Repositories',
        'Repository activity and release-adjacent status can now share the current-state ingestion pipeline.',
        typeMetric(github, 'repository', 'repos'),
      );
    case 'metrics-window':
      return {
        detail:
          'Provider-specific polling intervals are active now, and this surface will expand into historical filtering in Phase 4.',
        metric: `${integrations.totals.providers} sources`,
        state: 'ready',
        lines: integrations.integrations.map(
          (integration) =>
            `${integration.displayName}: every ${integration.pollingIntervalSeconds}s`,
        ),
      };
    case 'metrics-sources':
      return {
        detail:
          'The current ingest pipeline normalizes read-only snapshots from multiple upstream services into one backend model.',
        metric: `${integrations.totals.metrics} live metrics`,
        state: integrations.totals.metrics > 0 ? 'ready' : 'loading',
        lines: integrations.integrations.map(
          (integration) =>
            `${integration.displayName}: ${integration.status} with ${integration.syncState.assetCount} assets`,
        ),
      };
    default:
      return {};
  }
}

function integrationWidget(
  integration: IntegrationSummary | undefined,
  eyebrow: string,
  detail: string,
  metric: string,
): Partial<WidgetView> {
  if (!integration) {
    return {
      eyebrow,
      detail,
      state: 'loading',
    };
  }

  return {
    eyebrow,
    detail,
    metric,
    state: integrationState(integration),
    lines: [
      integration.headline,
      ...integration.highlights.slice(0, 2),
      `Last sync ${formatSyncAge(integration.syncState.lastCompletedAt)}`,
    ],
  };
}

function integrationState(
  integration: IntegrationSummary | undefined,
): WidgetView['state'] {
  if (!integration) {
    return 'loading';
  }

  if (integration.status === 'error') {
    return 'error';
  }

  if (integration.status === 'pending' || integration.status === 'syncing') {
    return 'loading';
  }

  if (integration.syncState.assetCount === 0) {
    return 'empty';
  }

  return 'ready';
}

function findIntegration(
  overview: IntegrationsOverviewResponse,
  provider: IntegrationSummary['provider'],
) {
  return overview.integrations.find(
    (integration) => integration.provider === provider,
  );
}

function typeMetric(
  integration: IntegrationSummary | undefined,
  type: string,
  label: string,
) {
  const count =
    integration?.assetsByType.find((entry) => entry.type === type)?.total ?? 0;

  return `${count} ${label}`;
}

function compareByLastCompletedAt(
  left: IntegrationSummary,
  right: IntegrationSummary,
) {
  return (
    new Date(right.syncState.lastCompletedAt ?? 0).getTime() -
    new Date(left.syncState.lastCompletedAt ?? 0).getTime()
  );
}

function formatSyncAge(lastCompletedAt: string | null) {
  if (!lastCompletedAt) {
    return 'awaiting first sync';
  }

  const diffMs = Date.now() - new Date(lastCompletedAt).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000));

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes === 1) {
    return '1 minute ago';
  }

  return `${diffMinutes} minutes ago`;
}

export function createPresetLayout(
  dashboard: DashboardResponse,
  preset: DashboardResponse['layout']['preset'],
): DashboardResponse['layout'] {
  return {
    preset,
    widgets: dashboard.layout.widgets.map((widget, index) => ({
      ...widget,
      columnSpan: preset === 'compact' ? 1 : index === 0 ? 2 : 1,
      rowSpan: 1,
    })),
  };
}
