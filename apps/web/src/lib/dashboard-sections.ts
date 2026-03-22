import type {
  CurrentMetricSnapshot,
  DashboardResponse,
  DashboardSlug,
  DashboardWidgetLayout,
  HealthResponse,
  IntegrationAsset,
  IntegrationDetailResponse,
  IntegrationProvider,
  IntegrationsOverviewResponse,
  IntegrationStatus,
  IntegrationSummary,
  WidgetFocusMode,
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
    description: 'Live collection health and current-state metric posture.',
  },
  {
    slug: 'alerts',
    label: 'Alerts',
    eyebrow: 'Awareness',
    description: 'Cross-provider attention signals until formal alert rules land.',
  },
];

type WidgetState = 'ready' | 'loading' | 'empty' | 'error';

export type WidgetTone = 'default' | 'success' | 'warning' | 'danger';

export interface WidgetStat {
  label: string;
  value: string;
  detail?: string;
  tone?: WidgetTone;
}

export interface WidgetListItem {
  label: string;
  value?: string;
  detail: string;
  tone?: WidgetTone;
}

export interface WidgetView {
  id: string;
  title: string;
  eyebrow: string;
  detail: string;
  metric?: string;
  tone?: WidgetTone;
  state: WidgetState;
  stats?: WidgetStat[];
  items?: WidgetListItem[];
  columnSpan: number;
  rowSpan: number;
  focus: WidgetFocusMode;
  updatedLabel?: string;
  navigationTarget?: DashboardSlug;
  refreshScope?: 'all' | IntegrationProvider;
}

interface SortableWidgetListItem extends WidgetListItem {
  timestamp?: string | null;
}

type IntegrationDetailsMap = Partial<
  Record<IntegrationProvider, IntegrationDetailResponse>
>;

interface WidgetBuildContext {
  health: HealthResponse | null;
  integrations: IntegrationsOverviewResponse | null;
  details: IntegrationDetailsMap;
}

interface ProviderContext {
  summary?: IntegrationSummary;
  detail?: IntegrationDetailResponse;
}

interface AttentionSignal extends SortableWidgetListItem {
  key: string;
}

const providerDashboardTargets: Record<IntegrationProvider, DashboardSlug> = {
  proxmox: 'home-lab',
  truenas: 'home-lab',
  unifi: 'home-lab',
  'home-assistant': 'media',
  plex: 'media',
  github: 'devops',
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
  details: IntegrationDetailsMap = {},
): WidgetView[] {
  const context: WidgetBuildContext = {
    health,
    integrations,
    details,
  };

  return dashboard.layout.widgets.map((widget) =>
    buildWidgetView(widget, context),
  );
}

function buildWidgetView(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
): WidgetView {
  const focus = widget.settings?.focus ?? 'summary';

  switch (widget.id) {
    case 'overview-compute':
      return buildOverviewComputeWidget(widget, context, focus);
    case 'overview-storage':
      return buildOverviewStorageWidget(widget, context, focus);
    case 'overview-network':
      return buildOverviewNetworkWidget(widget, context, focus);
    case 'overview-media':
      return buildOverviewMediaWidget(widget, context, focus);
    case 'overview-cicd':
      return buildOverviewCicdWidget(widget, context, focus);
    case 'overview-alerts':
      return buildAlertSummaryWidget(
        widget,
        context,
        focus,
        'overview',
        'Operational signals synthesized from current provider and asset warnings until the formal Phase 5 alert engine is online.',
      );
    case 'overview-feed':
      return buildActivityWidget(
        widget,
        context,
        focus,
        'Recent provider syncs and platform pulses ordered by freshness.',
      );
    case 'homelab-cluster':
      return buildHomelabClusterWidget(widget, context, focus);
    case 'homelab-guests':
      return buildHomelabGuestsWidget(widget, context, focus);
    case 'homelab-pools':
      return buildHomelabPoolsWidget(widget, context, focus);
    case 'homelab-capacity':
      return buildHomelabCapacityWidget(widget, context, focus);
    case 'homelab-network':
      return buildHomelabNetworkWidget(widget, context, focus);
    case 'homelab-clients':
      return buildHomelabClientsWidget(widget, context, focus);
    case 'media-home-entities':
      return buildHomeAssistantEntitiesWidget(widget, context, focus);
    case 'media-home-automations':
      return buildHomeAssistantAutomationsWidget(widget, context, focus);
    case 'media-streams':
      return buildPlexStreamsWidget(widget, context, focus);
    case 'media-libraries':
      return buildPlexLibrariesWidget(widget, context, focus);
    case 'devops-workflows':
      return buildGithubWorkflowsWidget(widget, context, focus);
    case 'devops-prs':
      return buildGithubPrsWidget(widget, context, focus);
    case 'devops-repositories':
      return buildGithubRepositoriesWidget(widget, context, focus);
    case 'devops-delivery':
      return buildGithubDeliveryWidget(widget, context, focus);
    case 'metrics-window':
      return buildMetricsSnapshotWidget(widget, context, focus);
    case 'metrics-sources':
      return buildMetricsSourcesWidget(widget, context, focus);
    case 'metrics-warnings':
      return buildMetricsWarningsWidget(widget, context, focus);
    case 'metrics-polling':
      return buildMetricsPollingWidget(widget, context, focus);
    case 'alerts-summary':
      return buildAlertSummaryWidget(
        widget,
        context,
        focus,
        'alerts',
        'This summary rolls up degraded providers plus warning and offline assets from the latest synchronized snapshots.',
      );
    case 'alerts-queue':
      return buildAlertQueueWidget(widget, context, focus);
    case 'alerts-history':
      return buildActivityWidget(
        widget,
        context,
        focus,
        'Recent provider sync completions and backend heartbeat activity.',
      );
    default:
      return createFallbackWidget(
        widget,
        focus,
        'Widget',
        'This widget will be wired to a future backend surface.',
      );
  }
}

function buildOverviewComputeWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'proxmox');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Compute',
      'Waiting for the Proxmox snapshot so cluster KPIs can render.',
      'proxmox',
    );
  }

  const nodes = assetsOfType(detail, ['node']);
  const guests = assetsOfType(detail, ['vm', 'lxc']);
  const warningGuests = guests.filter((asset) => asset.status !== 'online');
  const averageNodeCpu = average(
    nodes
      .map((asset) => readNumber(asset.metadata, 'cpuPercent'))
      .filter((value): value is number => value !== null),
  );

  return createWidget(widget, {
    eyebrow: 'Compute',
    detail: 'Cluster and guest posture sourced from the latest Proxmox sync.',
    metric: `${nodes.length} nodes`,
    tone: toneForProvider(provider.summary),
    state: stateForProvider(provider.summary),
    focus,
    refreshScope: 'proxmox',
    navigationTarget: 'home-lab',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat('Guests', `${guests.length}`, `${warningGuests.length} need attention`, warningGuests.length > 0 ? 'warning' : 'success'),
      stat(
        'Avg CPU',
        averageNodeCpu === null ? '--' : `${Math.round(averageNodeCpu)}%`,
        'Across visible nodes',
      ),
      stat(
        'Quorum',
        metricValueText(detail, 'cluster.quorum') ?? 'Healthy',
        'Cluster heartbeat',
        'success',
      ),
    ],
    items: finalizeItems(
      [
        itemFromAsset(findAsset(detail, 'cluster'), undefined, 'Cluster'),
        ...nodes.map((asset) =>
          itemFromAsset(
            asset,
            formatPercent(readNumber(asset.metadata, 'cpuPercent')),
            'Node',
          ),
        ),
        ...guests.map((asset) =>
          itemFromAsset(
            asset,
            readString(asset.metadata, 'powerState') ?? asset.status,
            asset.assetType.toUpperCase(),
          ),
        ),
      ],
      focus,
      4,
    ),
  });
}

function buildOverviewStorageWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'truenas');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Storage',
      'Waiting for the TrueNAS snapshot so pool health can render.',
      'truenas',
    );
  }

  const pools = assetsOfType(detail, ['pool']);
  const disks = assetsOfType(detail, ['disk']);
  const hottestDisk = maxByNumber(disks, (asset) =>
    readNumber(asset.metadata, 'temperatureC'),
  );
  const averageCapacity = average(
    pools
      .map((asset) => readNumber(asset.metadata, 'capacityPercent'))
      .filter((value): value is number => value !== null),
  );

  return createWidget(widget, {
    eyebrow: 'Storage',
    detail: 'Pool capacity and disk posture sourced from the TrueNAS snapshot.',
    metric: `${pools.length} pools`,
    tone: toneForProvider(provider.summary),
    state: stateForProvider(provider.summary),
    focus,
    refreshScope: 'truenas',
    navigationTarget: 'home-lab',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Avg Use',
        averageCapacity === null ? '--' : `${Math.round(averageCapacity)}%`,
        'Across visible pools',
        averageCapacity !== null && averageCapacity >= 65 ? 'warning' : 'default',
      ),
      stat(
        'Hottest Disk',
        hottestDisk
          ? `${readNumber(hottestDisk.metadata, 'temperatureC')}C`
          : '--',
        hottestDisk?.name ?? 'No disk telemetry',
        hottestDisk && hottestDisk.status !== 'online' ? 'warning' : 'default',
      ),
      stat(
        'Warnings',
        `${disks.filter((asset) => asset.status !== 'online').length}`,
        'Disk signals',
        disks.some((asset) => asset.status !== 'online') ? 'warning' : 'success',
      ),
    ],
    items: finalizeItems(
      [
        ...pools.map((asset) =>
          itemFromAsset(
            asset,
            formatPercent(readNumber(asset.metadata, 'capacityPercent')),
            'Pool',
          ),
        ),
        ...disks.map((asset) =>
          itemFromAsset(
            asset,
            readNumber(asset.metadata, 'temperatureC') === null
              ? undefined
              : `${readNumber(asset.metadata, 'temperatureC')}C`,
            'Disk',
          ),
        ),
      ],
      focus,
      4,
    ),
  });
}

function buildOverviewNetworkWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'unifi');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Network',
      'Waiting for the UniFi snapshot so gateway and client KPIs can render.',
      'unifi',
    );
  }

  const accessPoints = assetsOfType(detail, ['access-point']);
  const connectedClients = metricValueNumber(detail, 'clients.connected');
  const busiestAp = maxByNumber(accessPoints, (asset) =>
    readNumber(asset.metadata, 'clients'),
  );

  return createWidget(widget, {
    eyebrow: 'Network',
    detail: 'Gateway, switch, and wireless posture from the latest UniFi sync.',
    metric:
      connectedClients === null ? `${accessPoints.length} APs` : `${connectedClients} clients`,
    tone: toneForProvider(provider.summary),
    state: stateForProvider(provider.summary),
    focus,
    refreshScope: 'unifi',
    navigationTarget: 'home-lab',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Latency',
        metricValueText(detail, 'wan.latency') ?? '--',
        'WAN round-trip',
      ),
      stat(
        'Loss',
        metricValueText(detail, 'wan.packet-loss') ?? '--',
        'Packet loss',
      ),
      stat(
        'Busiest AP',
        busiestAp
          ? `${readNumber(busiestAp.metadata, 'clients') ?? 0} clients`
          : '--',
        busiestAp?.name ?? 'No AP telemetry',
      ),
    ],
    items: finalizeItems(
      [
        ...assetsOfType(detail, ['gateway', 'switch']).map((asset) =>
          itemFromAsset(asset, undefined, capitalize(asset.assetType)),
        ),
        ...accessPoints.map((asset) =>
          itemFromAsset(
            asset,
            `${readNumber(asset.metadata, 'clients') ?? 0} clients`,
            'Access Point',
          ),
        ),
      ],
      focus,
      4,
    ),
  });
}

function buildOverviewMediaWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'plex');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Media',
      'Waiting for the Plex snapshot so streaming KPIs can render.',
      'plex',
    );
  }

  const libraries = assetsOfType(detail, ['library']);
  const sessions = assetsOfType(detail, ['session']);

  return createWidget(widget, {
    eyebrow: 'Media',
    detail: 'Playback and library posture sourced from the latest Plex sync.',
    metric: `${sessions.length} streams`,
    tone: toneForProvider(provider.summary),
    state: stateForProvider(provider.summary),
    focus,
    refreshScope: 'plex',
    navigationTarget: 'media',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Transcodes',
        metricValueText(detail, 'streams.transcode') ?? '--',
        'Current conversion load',
        metricValueNumber(detail, 'streams.transcode') ? 'warning' : 'success',
      ),
      stat(
        'Bandwidth',
        metricValueText(detail, 'bandwidth.current') ?? '--',
        'Current downstream use',
      ),
      stat(
        'Libraries',
        `${libraries.length}`,
        `${sumNumbers(
          libraries.map((asset) => readNumber(asset.metadata, 'items')),
        ).toLocaleString()} items`,
      ),
    ],
    items: finalizeItems(
      [
        itemFromAsset(findAsset(detail, 'server'), undefined, 'Server'),
        ...sessions.map((asset) =>
          itemFromAsset(
            asset,
            readString(asset.metadata, 'mode') ?? 'playing',
            'Session',
          ),
        ),
      ],
      focus,
      4,
    ),
  });
}

function buildOverviewCicdWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'github');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'CI/CD',
      'Waiting for the GitHub snapshot so workflow and PR KPIs can render.',
      'github',
    );
  }

  const workflows = assetsOfType(detail, ['workflow']);
  const pullRequests = assetsOfType(detail, ['pull-request']);
  const warningPrs = pullRequests.filter((asset) => asset.status !== 'online');

  return createWidget(widget, {
    eyebrow: 'CI/CD',
    detail: 'Workflow and review posture sourced from the latest GitHub sync.',
    metric: `${pullRequests.length} open PRs`,
    tone: toneForProvider(provider.summary),
    state: stateForProvider(provider.summary),
    focus,
    refreshScope: 'github',
    navigationTarget: 'devops',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Recent Runs',
        metricValueText(detail, 'workflow.runs') ?? '--',
        'Tracked executions',
      ),
      stat(
        'Failed Jobs',
        metricValueText(detail, 'workflow.failures') ?? '--',
        'Needs operator follow-up',
        metricValueNumber(detail, 'workflow.failures') ? 'warning' : 'success',
      ),
      stat(
        'PR Attention',
        `${warningPrs.length}`,
        'Checks pending or degraded',
        warningPrs.length > 0 ? 'warning' : 'success',
      ),
    ],
    items: finalizeItems(
      [
        ...workflows.map((asset) =>
          itemFromAsset(
            asset,
            `${readNumber(asset.metadata, 'recentFailures') ?? 0} failures`,
            'Workflow',
          ),
        ),
        ...pullRequests.map((asset) =>
          itemFromAsset(
            asset,
            readString(asset.metadata, 'checks') ?? 'unknown',
            'Pull Request',
          ),
        ),
      ],
      focus,
      4,
    ),
  });
}

function buildAlertSummaryWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
  navigationTarget: DashboardSlug,
  detailText: string,
): WidgetView {
  const signals = attentionSignals(context);
  const providerCount = new Set(
    signals.map((signal) => signal.key.split(':')[0]),
  ).size;
  const offlineCount = signals.filter((signal) => signal.tone === 'danger').length;
  const warningCount = signals.filter((signal) => signal.tone === 'warning').length;

  return createWidget(widget, {
    eyebrow: 'Attention',
    detail: detailText,
    metric: `${signals.length} signals`,
    tone:
      signals.length === 0
        ? 'success'
        : offlineCount > 0
          ? 'danger'
          : 'warning',
    state: context.integrations ? 'ready' : 'loading',
    focus,
    refreshScope: 'all',
    navigationTarget,
    updatedLabel: freshestSyncAge(context),
    stats: [
      stat('Impacted', `${providerCount}`, 'Providers with active signals'),
      stat(
        'Offline',
        `${offlineCount}`,
        'Error providers or offline assets',
        offlineCount > 0 ? 'danger' : 'success',
      ),
      stat(
        'Warning',
        `${warningCount}`,
        'Degraded providers or warning assets',
        warningCount > 0 ? 'warning' : 'success',
      ),
    ],
    items:
      signals.length === 0
        ? [
            {
              label: 'All current snapshots are stable',
              value: 'Healthy',
              detail:
                'No degraded providers, warning assets, or offline assets are present in the current normalized snapshot.',
              tone: 'success',
            },
          ]
        : finalizeItems(signals, focus, 5),
  });
}

function buildActivityWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
  detailText: string,
): WidgetView {
  const items = activityItems(context);

  return createWidget(widget, {
    eyebrow: 'Activity',
    detail: detailText,
    metric: `${items.length} events`,
    tone: 'default',
    state: items.length > 0 ? 'ready' : context.integrations ? 'empty' : 'loading',
    focus,
    refreshScope: 'all',
    navigationTarget: 'alerts',
    updatedLabel: freshestSyncAge(context),
    stats: [
      stat(
        'Providers',
        `${context.integrations?.totals.providers ?? 0}`,
        'Reporting into the dashboard',
      ),
      stat(
        'Healthy',
        `${context.integrations?.totals.healthyProviders ?? 0}`,
        'Providers currently healthy',
        'success',
      ),
      stat(
        'Degraded',
        `${context.integrations?.totals.degradedProviders ?? 0}`,
        'Providers needing attention',
        context.integrations?.totals.degradedProviders ? 'warning' : 'success',
      ),
    ],
    items: finalizeItems(items, focus, 6),
  });
}

function buildHomelabClusterWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'proxmox');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Compute',
      'Waiting for the Proxmox cluster snapshot.',
      'proxmox',
    );
  }

  const cluster = findAsset(detail, 'cluster');
  const nodes = assetsOfType(detail, ['node']);

  return createWidget(widget, {
    eyebrow: 'Compute',
    detail: 'Cluster quorum, node load, and current infrastructure posture.',
    metric: cluster ? `${readNumber(cluster.metadata, 'guests') ?? 0} guests` : `${nodes.length} nodes`,
    tone: toneForProvider(provider.summary),
    state: stateForProvider(provider.summary),
    focus,
    refreshScope: 'proxmox',
    navigationTarget: 'home-lab',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat('Nodes', `${nodes.length}`, `${countByStatus(nodes, 'online')} online`, 'success'),
      stat(
        'Avg Memory',
        averageDisplay(nodes, 'memoryPercent'),
        'Across visible nodes',
      ),
      stat(
        'Avg Storage',
        averageDisplay(nodes, 'storagePercent'),
        'Node-local usage',
      ),
    ],
    items: finalizeItems(
      [
        cluster
          ? itemFromAsset(cluster, 'Cluster', 'Cluster')
          : null,
        ...nodes.map((asset) =>
          itemFromAsset(
            asset,
            [
              formatPercent(readNumber(asset.metadata, 'cpuPercent')),
              formatPercent(readNumber(asset.metadata, 'memoryPercent')),
            ]
              .filter(Boolean)
              .join(' CPU / '),
            'Node',
          ),
        ),
      ],
      focus,
      4,
    ),
  });
}

function buildHomelabGuestsWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'proxmox');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Guests',
      'Waiting for guest inventory from Proxmox.',
      'proxmox',
    );
  }

  const guests = assetsOfType(detail, ['vm', 'lxc']);
  const warningGuests = guests.filter((asset) => asset.status !== 'online');

  return createWidget(widget, {
    eyebrow: 'Guests',
    detail: 'VM and container runtime posture from the current Proxmox snapshot.',
    metric: `${guests.length} running`,
    tone: warningGuests.length > 0 ? 'warning' : 'success',
    state: guests.length > 0 ? 'ready' : 'empty',
    focus,
    refreshScope: 'proxmox',
    navigationTarget: 'home-lab',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat('VMs', `${assetsOfType(detail, ['vm']).length}`, 'Virtual machines'),
      stat('LXCs', `${assetsOfType(detail, ['lxc']).length}`, 'Containers'),
      stat(
        'Attention',
        `${warningGuests.length}`,
        'Guests outside healthy posture',
        warningGuests.length > 0 ? 'warning' : 'success',
      ),
    ],
    items: finalizeItems(
      guests.map((asset) =>
        itemFromAsset(
          asset,
          readString(asset.metadata, 'node') ?? 'unknown node',
          asset.assetType.toUpperCase(),
        ),
      ),
      focus,
      5,
    ),
  });
}

function buildHomelabPoolsWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'truenas');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Pools',
      'Waiting for pool inventory from TrueNAS.',
      'truenas',
    );
  }

  const pools = assetsOfType(detail, ['pool']);

  return createWidget(widget, {
    eyebrow: 'Pools',
    detail: 'Pool health, scrubs, and current storage posture.',
    metric: `${pools.length} pools`,
    tone: toneForProvider(provider.summary),
    state: pools.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'truenas',
    navigationTarget: 'home-lab',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat('Healthy', `${countByStatus(pools, 'online')}`, 'Pools online', 'success'),
      stat(
        'Warning',
        `${pools.filter((asset) => asset.status !== 'online').length}`,
        'Pools needing follow-up',
        pools.some((asset) => asset.status !== 'online') ? 'warning' : 'success',
      ),
      stat(
        'Max Use',
        maxPercentDisplay(pools, 'capacityPercent'),
        'Highest pool utilization',
      ),
    ],
    items: finalizeItems(
      pools.map((asset) =>
        itemFromAsset(
          asset,
          formatPercent(readNumber(asset.metadata, 'capacityPercent')),
          'Pool',
        ),
      ),
      focus,
      4,
    ),
  });
}

function buildHomelabCapacityWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'truenas');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Capacity',
      'Waiting for disk telemetry from TrueNAS.',
      'truenas',
    );
  }

  const disks = assetsOfType(detail, ['disk']);
  const hottestDisk = maxByNumber(disks, (asset) =>
    readNumber(asset.metadata, 'temperatureC'),
  );

  return createWidget(widget, {
    eyebrow: 'Capacity',
    detail: 'Disk thermals and pool capacity thresholds from the TrueNAS snapshot.',
    metric: hottestDisk
      ? `${readNumber(hottestDisk.metadata, 'temperatureC')}C`
      : `${disks.length} disks`,
    tone: hottestDisk && hottestDisk.status !== 'online' ? 'warning' : toneForProvider(provider.summary),
    state: disks.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'truenas',
    navigationTarget: 'home-lab',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Warm Disks',
        `${disks.filter((asset) => asset.status !== 'online').length}`,
        'Outside nominal temperature',
        disks.some((asset) => asset.status !== 'online') ? 'warning' : 'success',
      ),
      stat(
        'Pool Capacity',
        metricValueText(detail, 'pool.capacity') ?? averageDisplay(assetsOfType(detail, ['pool']), 'capacityPercent'),
        'Current utilization',
      ),
      stat(
        'Hottest',
        hottestDisk
          ? `${readNumber(hottestDisk.metadata, 'temperatureC')}C`
          : '--',
        hottestDisk?.name ?? 'No disk telemetry',
        hottestDisk && hottestDisk.status !== 'online' ? 'warning' : 'default',
      ),
    ],
    items: finalizeItems(
      disks.map((asset) =>
        itemFromAsset(
          asset,
          readNumber(asset.metadata, 'temperatureC') === null
            ? undefined
            : `${readNumber(asset.metadata, 'temperatureC')}C`,
          'Disk',
        ),
      ),
      focus,
      4,
    ),
  });
}

function buildHomelabNetworkWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'unifi');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Network',
      'Waiting for the UniFi infrastructure snapshot.',
      'unifi',
    );
  }

  const gateway = findAsset(detail, 'gateway');
  const switchAsset = findAsset(detail, 'switch');

  return createWidget(widget, {
    eyebrow: 'Network',
    detail: 'Gateway and switching posture from the current UniFi snapshot.',
    metric: metricValueText(detail, 'wan.latency') ?? 'Healthy',
    tone: toneForProvider(provider.summary),
    state: stateForProvider(provider.summary),
    focus,
    refreshScope: 'unifi',
    navigationTarget: 'home-lab',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Latency',
        metricValueText(detail, 'wan.latency') ?? '--',
        'WAN round-trip',
      ),
      stat(
        'Packet Loss',
        metricValueText(detail, 'wan.packet-loss') ?? '--',
        'Current WAN reliability',
      ),
      stat(
        'Active Ports',
        switchAsset
          ? `${readNumber(switchAsset.metadata, 'activePorts') ?? 0}`
          : '--',
        switchAsset?.name ?? 'Switch telemetry',
      ),
    ],
    items: finalizeItems(
      [
        gateway ? itemFromAsset(gateway, 'Gateway', 'Gateway') : null,
        switchAsset ? itemFromAsset(switchAsset, 'Switch', 'Switch') : null,
        ...assetsOfType(detail, ['access-point']).map((asset) =>
          itemFromAsset(
            asset,
            `${readNumber(asset.metadata, 'clients') ?? 0} clients`,
            'Access Point',
          ),
        ),
      ],
      focus,
      4,
    ),
  });
}

function buildHomelabClientsWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'unifi');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Clients',
      'Waiting for UniFi client distribution data.',
      'unifi',
    );
  }

  const accessPoints = assetsOfType(detail, ['access-point']);
  const totalClients = metricValueNumber(detail, 'clients.connected');
  const busiestAp = maxByNumber(accessPoints, (asset) =>
    readNumber(asset.metadata, 'clients'),
  );

  return createWidget(widget, {
    eyebrow: 'Clients',
    detail: 'Wireless client distribution by access point.',
    metric:
      totalClients === null ? `${accessPoints.length} APs` : `${totalClients} clients`,
    tone: toneForProvider(provider.summary),
    state: accessPoints.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'unifi',
    navigationTarget: 'home-lab',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'AP Count',
        `${accessPoints.length}`,
        'Reporting access points',
      ),
      stat(
        'Busiest AP',
        busiestAp
          ? `${readNumber(busiestAp.metadata, 'clients') ?? 0} clients`
          : '--',
        busiestAp?.name ?? 'No AP telemetry',
      ),
      stat(
        'Average Load',
        totalClients === null || accessPoints.length === 0
          ? '--'
          : `${Math.round(totalClients / accessPoints.length)} clients`,
        'Per access point',
      ),
    ],
    items: finalizeItems(
      accessPoints.map((asset) =>
        itemFromAsset(
          asset,
          `${readNumber(asset.metadata, 'clients') ?? 0} clients`,
          'Access Point',
        ),
      ),
      focus,
      4,
    ),
  });
}

function buildHomeAssistantEntitiesWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'home-assistant');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Entities',
      'Waiting for the Home Assistant entity snapshot.',
      'home-assistant',
    );
  }

  const entities = assetsOfType(detail, ['entity']);
  const officeTemperature = entities.find((asset) =>
    asset.externalId.includes('office_temperature'),
  );

  return createWidget(widget, {
    eyebrow: 'Entities',
    detail: 'Read-only entity state from the Home Assistant snapshot.',
    metric: metricValueText(detail, 'entity.count') ?? `${entities.length} entities`,
    tone: toneForProvider(provider.summary),
    state: entities.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'home-assistant',
    navigationTarget: 'media',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Visible',
        metricValueText(detail, 'entity.count') ?? `${entities.length}`,
        'Normalized entities',
      ),
      stat(
        'Office Temp',
        officeTemperature
          ? `${readString(officeTemperature.metadata, 'state') ?? '--'}${readString(officeTemperature.metadata, 'unit') ?? ''}`
          : '--',
        officeTemperature?.name ?? 'Sensor',
      ),
      stat(
        'Energy Today',
        metricValueText(detail, 'energy.today') ?? '--',
        'Daily energy reading',
      ),
    ],
    items: finalizeItems(
      entities.map((asset) =>
        itemFromAsset(
          asset,
          formatEntityState(asset),
          'Entity',
        ),
      ),
      focus,
      4,
    ),
  });
}

function buildHomeAssistantAutomationsWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'home-assistant');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Automation',
      'Waiting for Home Assistant automation inventory.',
      'home-assistant',
    );
  }

  const automations = assetsOfType(detail, ['automation']);

  return createWidget(widget, {
    eyebrow: 'Automation',
    detail: 'Automation enablement and recent read-only posture from Home Assistant.',
    metric:
      metricValueText(detail, 'automation.enabled') ?? `${automations.length} enabled`,
    tone: toneForProvider(provider.summary),
    state: automations.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'home-assistant',
    navigationTarget: 'media',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Enabled',
        metricValueText(detail, 'automation.enabled') ?? `${automations.length}`,
        'Automations visible now',
        'success',
      ),
      stat(
        'Healthy',
        `${countByStatus(automations, 'online')}`,
        'Reporting online',
        'success',
      ),
      stat(
        'Warnings',
        `${automations.filter((asset) => asset.status !== 'online').length}`,
        'Degraded automations',
        automations.some((asset) => asset.status !== 'online')
          ? 'warning'
          : 'success',
      ),
    ],
    items: finalizeItems(
      automations.map((asset) =>
        itemFromAsset(
          asset,
          readBoolean(asset.metadata, 'enabled') ? 'enabled' : 'disabled',
          'Automation',
        ),
      ),
      focus,
      4,
    ),
  });
}

function buildPlexStreamsWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'plex');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Playback',
      'Waiting for the Plex session snapshot.',
      'plex',
    );
  }

  const sessions = assetsOfType(detail, ['session']);
  const server = findAsset(detail, 'server');

  return createWidget(widget, {
    eyebrow: 'Playback',
    detail: 'Current Plex session and transcode posture from the latest snapshot.',
    metric: metricValueText(detail, 'streams.active') ?? `${sessions.length} active`,
    tone: toneForProvider(provider.summary),
    state: sessions.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'plex',
    navigationTarget: 'media',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Active',
        metricValueText(detail, 'streams.active') ?? `${sessions.length}`,
        'Current sessions',
      ),
      stat(
        'Transcodes',
        metricValueText(detail, 'streams.transcode') ?? '--',
        'Conversion pressure',
        metricValueNumber(detail, 'streams.transcode') ? 'warning' : 'success',
      ),
      stat(
        'Bandwidth',
        metricValueText(detail, 'bandwidth.current') ?? '--',
        'Current downstream use',
      ),
    ],
    items: finalizeItems(
      [
        server ? itemFromAsset(server, 'Server', 'Server') : null,
        ...sessions.map((asset) =>
          itemFromAsset(
            asset,
            readString(asset.metadata, 'mode') ?? 'playing',
            'Session',
          ),
        ),
      ],
      focus,
      4,
    ),
  });
}

function buildPlexLibrariesWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'plex');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Libraries',
      'Waiting for the Plex library snapshot.',
      'plex',
    );
  }

  const libraries = assetsOfType(detail, ['library']);
  const totalItems = sumNumbers(
    libraries.map((asset) => readNumber(asset.metadata, 'items')),
  );

  return createWidget(widget, {
    eyebrow: 'Libraries',
    detail: 'Library counts and server indexing posture from the Plex snapshot.',
    metric: `${totalItems.toLocaleString()} items`,
    tone: toneForProvider(provider.summary),
    state: libraries.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'plex',
    navigationTarget: 'media',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat('Libraries', `${libraries.length}`, 'Visible libraries'),
      stat(
        'Largest',
        maxItemCountLabel(libraries),
        'Most populated library',
      ),
      stat(
        'Server',
        findAsset(detail, 'server')?.status === 'warning' ? 'Elevated' : 'Stable',
        'Current server posture',
        findAsset(detail, 'server')?.status === 'warning' ? 'warning' : 'success',
      ),
    ],
    items: finalizeItems(
      libraries.map((asset) =>
        itemFromAsset(
          asset,
          `${(readNumber(asset.metadata, 'items') ?? 0).toLocaleString()} items`,
          'Library',
        ),
      ),
      focus,
      4,
    ),
  });
}

function buildGithubWorkflowsWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'github');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Workflows',
      'Waiting for GitHub workflow status.',
      'github',
    );
  }

  const workflows = assetsOfType(detail, ['workflow']);

  return createWidget(widget, {
    eyebrow: 'Workflows',
    detail: 'Workflow run posture and recent failures from GitHub Actions.',
    metric: metricValueText(detail, 'workflow.runs') ?? `${workflows.length} workflows`,
    tone: toneForProvider(provider.summary),
    state: workflows.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'github',
    navigationTarget: 'devops',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Tracked',
        `${workflows.length}`,
        'Visible workflows',
      ),
      stat(
        'Failed Jobs',
        metricValueText(detail, 'workflow.failures') ?? '--',
        'Recent failures',
        metricValueNumber(detail, 'workflow.failures') ? 'warning' : 'success',
      ),
      stat(
        'Healthy',
        `${countByStatus(workflows, 'online')}`,
        'Workflow definitions healthy',
        'success',
      ),
    ],
    items: finalizeItems(
      workflows.map((asset) =>
        itemFromAsset(
          asset,
          `${readNumber(asset.metadata, 'recentFailures') ?? 0} failures`,
          'Workflow',
        ),
      ),
      focus,
      4,
    ),
  });
}

function buildGithubPrsWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'github');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Reviews',
      'Waiting for GitHub pull request status.',
      'github',
    );
  }

  const pullRequests = assetsOfType(detail, ['pull-request']);
  const pending = pullRequests.filter(
    (asset) => readString(asset.metadata, 'checks') === 'pending',
  );

  return createWidget(widget, {
    eyebrow: 'Reviews',
    detail: 'Open pull requests and status-check posture from GitHub.',
    metric:
      metricValueText(detail, 'pull-requests.open') ?? `${pullRequests.length} open`,
    tone: pending.length > 0 ? 'warning' : toneForProvider(provider.summary),
    state: pullRequests.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'github',
    navigationTarget: 'devops',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat('Open', `${pullRequests.length}`, 'Visible pull requests'),
      stat(
        'Passing',
        `${pullRequests.filter((asset) => readString(asset.metadata, 'checks') === 'passing').length}`,
        'Checks green',
        'success',
      ),
      stat(
        'Pending',
        `${pending.length}`,
        'Awaiting required status',
        pending.length > 0 ? 'warning' : 'success',
      ),
    ],
    items: finalizeItems(
      pullRequests.map((asset) =>
        itemFromAsset(
          asset,
          readString(asset.metadata, 'checks') ?? 'unknown',
          'Pull Request',
        ),
      ),
      focus,
      4,
    ),
  });
}

function buildGithubRepositoriesWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'github');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Repositories',
      'Waiting for GitHub repository status.',
      'github',
    );
  }

  const repositories = assetsOfType(detail, ['repository']);

  return createWidget(widget, {
    eyebrow: 'Repositories',
    detail: 'Repository-level branch posture and current tracked inventory.',
    metric: `${repositories.length} repos`,
    tone: toneForProvider(provider.summary),
    state: repositories.length > 0 ? stateForProvider(provider.summary) : 'empty',
    focus,
    refreshScope: 'github',
    navigationTarget: 'devops',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat('Tracked', `${repositories.length}`, 'Repositories in view'),
      stat(
        'Default Branch',
        readString(repositories[0]?.metadata, 'defaultBranch') ?? 'main',
        repositories[0]?.name ?? 'Tracked repo',
      ),
      stat(
        'Branch Posture',
        'Protected',
        'Main branch protections remain green',
        'success',
      ),
    ],
    items: finalizeItems(
      [
        ...repositories.map((asset) =>
          itemFromAsset(
            asset,
            readString(asset.metadata, 'defaultBranch') ?? 'main',
            'Repository',
          ),
        ),
        ...detail.integration.highlights.map((highlight, index) => ({
          label: index === 0 ? 'Snapshot highlight' : 'Operator note',
          detail: highlight,
          tone: (
            highlight.includes('failed') ? 'warning' : 'default'
          ) as WidgetTone,
        })),
      ],
      focus,
      4,
    ),
  });
}

function buildGithubDeliveryWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const provider = getProviderContext(context, 'github');
  const detail = provider.detail;

  if (!detail) {
    return createProviderLoadingWidget(
      widget,
      focus,
      'Delivery',
      'Waiting for GitHub delivery attention signals.',
      'github',
    );
  }

  const deliverySignals = finalizeItems(
    [
      ...assetsOfType(detail, ['workflow']).map((asset) =>
        itemFromAsset(
          asset,
          `${readNumber(asset.metadata, 'recentFailures') ?? 0} failures`,
          'Workflow',
        ),
      ),
      ...assetsOfType(detail, ['pull-request']).map((asset) =>
        itemFromAsset(
          asset,
          readString(asset.metadata, 'checks') ?? 'unknown',
          'Pull Request',
        ),
      ),
    ],
    focus,
    4,
  );

  return createWidget(widget, {
    eyebrow: 'Delivery',
    detail: 'Failures, pending checks, and release-adjacent follow-up items.',
    metric: `${deliverySignals.filter((item) => item.tone === 'warning').length} queued`,
    tone: deliverySignals.some((item) => item.tone === 'warning')
      ? 'warning'
      : 'success',
    state: deliverySignals.length > 0 ? 'ready' : 'empty',
    focus,
    refreshScope: 'github',
    navigationTarget: 'devops',
    updatedLabel: formatSyncAge(detail.integration.syncState.lastCompletedAt),
    stats: [
      stat(
        'Failures',
        metricValueText(detail, 'workflow.failures') ?? '--',
        'Recent failed jobs',
        metricValueNumber(detail, 'workflow.failures') ? 'warning' : 'success',
      ),
      stat(
        'Pending PRs',
        `${assetsOfType(detail, ['pull-request']).filter((asset) => readString(asset.metadata, 'checks') === 'pending').length}`,
        'Checks outstanding',
        'warning',
      ),
      stat(
        'Ready Workflows',
        `${assetsOfType(detail, ['workflow']).filter((asset) => asset.status === 'online').length}`,
        'Healthy definitions',
        'success',
      ),
    ],
    items: deliverySignals,
  });
}

function buildMetricsSnapshotWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const currentMetrics = allCurrentMetrics(context);

  return createWidget(widget, {
    eyebrow: 'Live Snapshot',
    detail: 'Current-state metrics captured from all normalized providers.',
    metric: `${currentMetrics.length} metrics`,
    tone: currentMetrics.some((metric) => metric.status === 'warning' || metric.status === 'critical')
      ? 'warning'
      : 'success',
    state: context.integrations ? 'ready' : 'loading',
    focus,
    refreshScope: 'all',
    navigationTarget: 'metrics',
    updatedLabel: freshestSyncAge(context),
    stats: [
      stat(
        'Providers',
        `${context.integrations?.totals.providers ?? 0}`,
        'Reporting sources',
      ),
      stat(
        'Assets',
        `${context.integrations?.totals.assets ?? 0}`,
        'Normalized resources',
      ),
      stat(
        'Healthy',
        `${context.integrations?.totals.healthyProviders ?? 0}`,
        'Healthy providers',
        'success',
      ),
    ],
    items: finalizeItems(
      currentMetrics.slice(0, 6).map((metric) => ({
        label: metric.label,
        value: metric.valueText,
        detail: metric.scopeKey,
        tone: toneForMetricStatus(metric.status),
      })),
      focus,
      6,
    ),
  });
}

function buildMetricsSourcesWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const items =
    context.integrations?.integrations.map((integration) => ({
      label: integration.displayName,
      value: integration.status,
      detail: `${integration.syncState.assetCount} assets • ${integration.syncState.metricCount} metrics`,
      tone: toneForIntegrationStatus(integration.status),
    })) ?? [];

  return createWidget(widget, {
    eyebrow: 'Sources',
    detail: 'Provider health, sync counts, and current ingest posture.',
    metric: `${items.length} sources`,
    tone: items.some((item) => item.tone === 'warning' || item.tone === 'danger')
      ? 'warning'
      : 'success',
    state: context.integrations ? 'ready' : 'loading',
    focus,
    refreshScope: 'all',
    navigationTarget: 'metrics',
    updatedLabel: freshestSyncAge(context),
    stats: [
      stat(
        'Healthy',
        `${context.integrations?.totals.healthyProviders ?? 0}`,
        'Providers currently healthy',
        'success',
      ),
      stat(
        'Degraded',
        `${context.integrations?.totals.degradedProviders ?? 0}`,
        'Providers needing follow-up',
        context.integrations?.totals.degradedProviders ? 'warning' : 'success',
      ),
      stat(
        'Metrics',
        `${context.integrations?.totals.metrics ?? 0}`,
        'Current metric samples',
      ),
    ],
    items: finalizeItems(items, focus, 6),
  });
}

function buildMetricsWarningsWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const warningMetrics = allCurrentMetrics(context).filter(
    (metric) => metric.status === 'warning' || metric.status === 'critical',
  );

  return createWidget(widget, {
    eyebrow: 'Warnings',
    detail: 'Current metrics that already indicate warning or critical posture.',
    metric: `${warningMetrics.length} flagged`,
    tone: warningMetrics.some((metric) => metric.status === 'critical')
      ? 'danger'
      : warningMetrics.length > 0
        ? 'warning'
        : 'success',
    state: context.integrations ? 'ready' : 'loading',
    focus,
    refreshScope: 'all',
    navigationTarget: 'alerts',
    updatedLabel: freshestSyncAge(context),
    stats: [
      stat(
        'Critical',
        `${warningMetrics.filter((metric) => metric.status === 'critical').length}`,
        'Immediate follow-up',
        warningMetrics.some((metric) => metric.status === 'critical')
          ? 'danger'
          : 'success',
      ),
      stat(
        'Warning',
        `${warningMetrics.filter((metric) => metric.status === 'warning').length}`,
        'Needs attention',
        warningMetrics.some((metric) => metric.status === 'warning')
          ? 'warning'
          : 'success',
      ),
      stat(
        'Providers',
        `${new Set(warningMetrics.map((metric) => metric.provider)).size}`,
        'Affected integrations',
      ),
    ],
    items:
      warningMetrics.length > 0
        ? finalizeItems(
            warningMetrics.map((metric) => ({
              label: `${providerLabel(metric.provider)} • ${metric.label}`,
              value: metric.valueText,
              detail: metric.scopeKey,
              tone: toneForMetricStatus(metric.status),
            })),
            focus,
            6,
          )
        : [
            {
              label: 'No warning metrics in the current snapshot',
              value: 'Clear',
              detail:
                'All retained current-state metrics are presently within their normal operating range.',
              tone: 'success',
            },
          ],
  });
}

function buildMetricsPollingWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const items =
    context.integrations?.integrations.map((integration) => ({
      label: integration.displayName,
      value: `${integration.pollingIntervalSeconds}s`,
      detail: `Last sync ${formatSyncAge(
        integration.syncState.lastCompletedAt,
      )}`,
      tone: toneForIntegrationStatus(integration.status),
    })) ?? [];

  return createWidget(widget, {
    eyebrow: 'Polling',
    detail: 'Provider-specific collection cadence for the current read-only sync pipeline.',
    metric: items.length > 0 ? `${items.length} intervals` : undefined,
    tone: 'default',
    state: context.integrations ? 'ready' : 'loading',
    focus,
    refreshScope: 'all',
    navigationTarget: 'metrics',
    updatedLabel: freshestSyncAge(context),
    stats: [
      stat(
        'Fastest',
        formatInterval(minimumInterval(context.integrations)),
        'Shortest poll interval',
      ),
      stat(
        'Slowest',
        formatInterval(maximumInterval(context.integrations)),
        'Longest poll interval',
      ),
      stat(
        'Average',
        formatInterval(averageInterval(context.integrations)),
        'Mean poll interval',
      ),
    ],
    items: finalizeItems(items, focus, 6),
  });
}

function buildAlertQueueWidget(
  widget: DashboardWidgetLayout,
  context: WidgetBuildContext,
  focus: WidgetFocusMode,
): WidgetView {
  const signals = attentionSignals(context);

  return createWidget(widget, {
    eyebrow: 'Queue',
    detail: 'Highest-priority synthesized alerts ordered by severity and freshness.',
    metric: `${signals.length} queued`,
    tone:
      signals.some((signal) => signal.tone === 'danger')
        ? 'danger'
        : signals.length > 0
          ? 'warning'
          : 'success',
    state: context.integrations ? 'ready' : 'loading',
    focus,
    refreshScope: 'all',
    navigationTarget: 'alerts',
    updatedLabel: freshestSyncAge(context),
    stats: [
      stat(
        'Top Severity',
        signals.some((signal) => signal.tone === 'danger') ? 'Danger' : signals.length > 0 ? 'Warning' : 'Clear',
        'Current highest signal',
        signals.some((signal) => signal.tone === 'danger')
          ? 'danger'
          : signals.length > 0
            ? 'warning'
            : 'success',
      ),
      stat(
        'Freshest',
        signals[0]?.value ?? 'Clear',
        signals[0]?.label ?? 'No active signals',
      ),
      stat(
        'Providers',
        `${new Set(signals.map((signal) => signal.key.split(':')[0])).size}`,
        'Affected integrations',
      ),
    ],
    items:
      signals.length > 0
        ? finalizeItems(signals, focus, 6)
        : [
            {
              label: 'Queue is clear',
              value: '0',
              detail:
                'No degraded providers or warning assets are currently present in the normalized snapshot.',
              tone: 'success',
            },
          ],
  });
}

function createWidget(
  widget: DashboardWidgetLayout,
  overrides: Omit<WidgetView, 'id' | 'title' | 'columnSpan' | 'rowSpan'>,
): WidgetView {
  return {
    id: widget.id,
    title: widget.title,
    columnSpan: widget.columnSpan,
    rowSpan: widget.rowSpan,
    ...overrides,
  };
}

function createFallbackWidget(
  widget: DashboardWidgetLayout,
  focus: WidgetFocusMode,
  eyebrow: string,
  detail: string,
): WidgetView {
  return createWidget(widget, {
    eyebrow,
    detail,
    state: 'loading',
    focus,
    tone: 'default',
  });
}

function createProviderLoadingWidget(
  widget: DashboardWidgetLayout,
  focus: WidgetFocusMode,
  eyebrow: string,
  detail: string,
  provider: IntegrationProvider,
): WidgetView {
  return createWidget(widget, {
    eyebrow,
    detail,
    state: 'loading',
    focus,
    tone: 'default',
    refreshScope: provider,
    navigationTarget: providerDashboardTargets[provider],
  });
}

function getProviderContext(
  context: WidgetBuildContext,
  provider: IntegrationProvider,
): ProviderContext {
  return {
    detail: context.details[provider],
    summary:
      context.details[provider]?.integration ??
      context.integrations?.integrations.find(
        (integration) => integration.provider === provider,
      ),
  };
}

function stateForProvider(summary: IntegrationSummary | undefined): WidgetState {
  if (!summary) {
    return 'loading';
  }

  if (summary.status === 'error') {
    return 'error';
  }

  if (summary.status === 'pending' || summary.status === 'syncing') {
    return 'loading';
  }

  if (summary.syncState.assetCount === 0) {
    return 'empty';
  }

  return 'ready';
}

function toneForProvider(
  summary: IntegrationSummary | undefined,
): WidgetTone {
  if (!summary) {
    return 'default';
  }

  return toneForIntegrationStatus(summary.status);
}

function toneForIntegrationStatus(status: IntegrationStatus): WidgetTone {
  if (status === 'error') {
    return 'danger';
  }

  if (status === 'degraded' || status === 'syncing' || status === 'pending') {
    return 'warning';
  }

  if (status === 'healthy') {
    return 'success';
  }

  return 'default';
}

function toneForMetricStatus(
  status: CurrentMetricSnapshot['status'],
): WidgetTone {
  if (status === 'critical') {
    return 'danger';
  }

  if (status === 'warning') {
    return 'warning';
  }

  if (status === 'normal') {
    return 'success';
  }

  return 'default';
}

function assetsOfType(
  detail: IntegrationDetailResponse,
  types: string[],
) {
  const typeSet = new Set(types);
  return detail.assets.filter((asset) => typeSet.has(asset.assetType));
}

function findAsset(detail: IntegrationDetailResponse, type: string) {
  return detail.assets.find((asset) => asset.assetType === type);
}

function metricValueText(detail: IntegrationDetailResponse, key: string) {
  return detail.metrics.find((metric) => metric.key === key)?.valueText;
}

function metricValueNumber(detail: IntegrationDetailResponse, key: string) {
  return (
    detail.metrics.find((metric) => metric.key === key)?.valueNumber ?? null
  );
}

function readNumber(
  source: IntegrationAsset['metadata'] | CurrentMetricSnapshot['metadata'],
  key: string,
) {
  const value = source[key];
  return typeof value === 'number' ? value : null;
}

function readString(
  source: IntegrationAsset['metadata'] | CurrentMetricSnapshot['metadata'] | undefined,
  key: string,
) {
  if (!source) {
    return null;
  }

  const value = source[key];
  return typeof value === 'string' ? value : null;
}

function readBoolean(source: IntegrationAsset['metadata'], key: string) {
  const value = source[key];
  return typeof value === 'boolean' ? value : null;
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageDisplay(assets: IntegrationAsset[], key: string) {
  const value = average(
    assets
      .map((asset) => readNumber(asset.metadata, key))
      .filter((entry): entry is number => entry !== null),
  );

  return value === null ? '--' : `${Math.round(value)}%`;
}

function maxPercentDisplay(assets: IntegrationAsset[], key: string) {
  const max = Math.max(
    ...assets
      .map((asset) => readNumber(asset.metadata, key))
      .filter((entry): entry is number => entry !== null),
  );

  return Number.isFinite(max) ? `${Math.round(max)}%` : '--';
}

function maxByNumber(
  assets: IntegrationAsset[],
  selector: (asset: IntegrationAsset) => number | null,
) {
  return assets.reduce<IntegrationAsset | null>((current, asset) => {
    const nextValue = selector(asset);

    if (nextValue === null) {
      return current;
    }

    if (!current) {
      return asset;
    }

    const currentValue = selector(current);
    return currentValue === null || nextValue > currentValue ? asset : current;
  }, null);
}

function itemFromAsset(
  asset: IntegrationAsset | undefined,
  value?: string,
  prefix?: string,
): SortableWidgetListItem | null {
  if (!asset) {
    return null;
  }

  return {
    label: prefix ? `${prefix} • ${asset.name}` : asset.name,
    value,
    detail: asset.summary,
    tone: toneForAssetStatus(asset.status),
    timestamp: asset.lastSeenAt,
  };
}

function toneForAssetStatus(status: IntegrationAsset['status']): WidgetTone {
  if (status === 'offline') {
    return 'danger';
  }

  if (status === 'warning') {
    return 'warning';
  }

  if (status === 'online') {
    return 'success';
  }

  return 'default';
}

function finalizeItems(
  items: Array<SortableWidgetListItem | null | undefined>,
  focus: WidgetFocusMode,
  limit: number,
): WidgetListItem[] {
  const filtered = items.filter(
    (item): item is SortableWidgetListItem => Boolean(item),
  );

  if (focus === 'attention') {
    filtered.sort((left, right) => {
      const toneDelta =
        toneRank(right.tone ?? 'default') - toneRank(left.tone ?? 'default');

      if (toneDelta !== 0) {
        return toneDelta;
      }

      return compareTimestamps(right.timestamp, left.timestamp);
    });
  }

  return filtered.slice(0, limit).map((item) => ({
    label: item.label,
    value: item.value,
    detail: item.detail,
    tone: item.tone,
  }));
}

function attentionSignals(context: WidgetBuildContext): AttentionSignal[] {
  const signals: AttentionSignal[] = [];

  Object.values(context.details).forEach((detail) => {
    if (!detail) {
      return;
    }

    if (
      detail.integration.status === 'degraded' ||
      detail.integration.status === 'error'
    ) {
      signals.push({
        key: `${detail.integration.provider}:integration`,
        label: `${detail.integration.displayName} sync`,
        value: formatSyncAge(detail.integration.syncState.lastCompletedAt),
        detail:
          detail.integration.syncState.lastError ?? detail.integration.headline,
        tone:
          detail.integration.status === 'error' ? 'danger' : 'warning',
        timestamp:
          detail.integration.syncState.lastCompletedAt ??
          detail.integration.syncState.lastStartedAt,
      });
    }

    detail.assets.forEach((asset) => {
      if (asset.status === 'online' || asset.status === 'unknown') {
        return;
      }

      signals.push({
        key: `${detail.integration.provider}:${asset.id}`,
        label: `${detail.integration.displayName} • ${asset.name}`,
        value: asset.status === 'offline' ? 'offline' : 'warning',
        detail: asset.summary,
        tone: toneForAssetStatus(asset.status),
        timestamp: asset.lastSeenAt,
      });
    });
  });

  signals.sort((left, right) => {
    const toneDelta =
      toneRank(right.tone ?? 'default') - toneRank(left.tone ?? 'default');

    if (toneDelta !== 0) {
      return toneDelta;
    }

    return compareTimestamps(right.timestamp, left.timestamp);
  });

  return signals;
}

function activityItems(context: WidgetBuildContext): SortableWidgetListItem[] {
  const items: SortableWidgetListItem[] = [];

  if (context.health) {
    items.push({
      label: 'nexus-api heartbeat',
      value: formatSyncAge(context.health.timestamp),
      detail:
        context.health.status === 'ok'
          ? 'Backend heartbeat completed successfully.'
          : 'Backend heartbeat is reporting degraded status.',
      tone: context.health.status === 'ok' ? 'success' : 'warning',
      timestamp: context.health.timestamp,
    });
  }

  Object.values(context.details).forEach((detail) => {
    if (!detail) {
      return;
    }

    items.push({
      label: `${detail.integration.displayName} sync`,
      value: formatSyncAge(detail.integration.syncState.lastCompletedAt),
      detail: detail.integration.headline,
      tone: toneForProvider(detail.integration),
      timestamp: detail.integration.syncState.lastCompletedAt,
    });
  });

  items.sort((left, right) => compareTimestamps(right.timestamp, left.timestamp));
  return items;
}

function freshestSyncAge(context: WidgetBuildContext) {
  const timestamps = [
    context.health?.timestamp ?? null,
    ...Object.values(context.details).map(
      (detail) => detail?.integration.syncState.lastCompletedAt ?? null,
    ),
  ].filter((value): value is string => Boolean(value));

  if (timestamps.length === 0) {
    return undefined;
  }

  timestamps.sort((left, right) => compareTimestamps(right, left));
  return formatSyncAge(timestamps[0] ?? null);
}

function allCurrentMetrics(context: WidgetBuildContext) {
  return Object.values(context.details).flatMap((detail) => detail?.metrics ?? []);
}

function providerLabel(provider: IntegrationProvider) {
  return (
    contextProviderLabels[provider] ??
    provider.replace(/(^|-)([a-z])/g, (_, prefix: string, letter: string) =>
      `${prefix === '-' ? ' ' : ''}${letter.toUpperCase()}`,
    )
  );
}

const contextProviderLabels: Record<IntegrationProvider, string> = {
  proxmox: 'Proxmox',
  truenas: 'TrueNAS',
  unifi: 'UniFi',
  'home-assistant': 'Home Assistant',
  plex: 'Plex',
  github: 'GitHub',
};

function countByStatus(
  assets: IntegrationAsset[],
  status: IntegrationAsset['status'],
) {
  return assets.filter((asset) => asset.status === status).length;
}

function formatSyncAge(timestamp: string | null) {
  if (!timestamp) {
    return 'awaiting sync';
  }

  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000));

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
}

function compareTimestamps(
  left: string | null | undefined,
  right: string | null | undefined,
) {
  return new Date(left ?? 0).getTime() - new Date(right ?? 0).getTime();
}

function toneRank(tone: WidgetTone) {
  if (tone === 'danger') {
    return 3;
  }

  if (tone === 'warning') {
    return 2;
  }

  if (tone === 'success') {
    return 1;
  }

  return 0;
}

function stat(
  label: string,
  value: string,
  detail?: string,
  tone: WidgetTone = 'default',
): WidgetStat {
  return { label, value, detail, tone };
}

function formatPercent(value: number | null) {
  return value === null ? undefined : `${Math.round(value)}%`;
}

function sumNumbers(values: Array<number | null>) {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function maxItemCountLabel(libraries: IntegrationAsset[]) {
  const largest = maxByNumber(libraries, (asset) =>
    readNumber(asset.metadata, 'items'),
  );

  if (!largest) {
    return '--';
  }

  const count = readNumber(largest.metadata, 'items') ?? 0;
  return `${count.toLocaleString()} items`;
}

function formatEntityState(asset: IntegrationAsset) {
  const state = readString(asset.metadata, 'state');
  const unit = readString(asset.metadata, 'unit');

  if (!state) {
    return 'state unavailable';
  }

  return `${state}${unit ?? ''}`;
}

function minimumInterval(overview: IntegrationsOverviewResponse | null) {
  if (!overview || overview.integrations.length === 0) {
    return null;
  }

  return Math.min(
    ...overview.integrations.map((integration) => integration.pollingIntervalSeconds),
  );
}

function maximumInterval(overview: IntegrationsOverviewResponse | null) {
  if (!overview || overview.integrations.length === 0) {
    return null;
  }

  return Math.max(
    ...overview.integrations.map((integration) => integration.pollingIntervalSeconds),
  );
}

function averageInterval(overview: IntegrationsOverviewResponse | null) {
  if (!overview || overview.integrations.length === 0) {
    return null;
  }

  return Math.round(
    overview.integrations.reduce(
      (sum, integration) => sum + integration.pollingIntervalSeconds,
      0,
    ) / overview.integrations.length,
  );
}

function formatInterval(value: number | null) {
  return value === null ? '--' : `${value}s`;
}

export function createPresetLayout(
  dashboard: DashboardResponse,
  preset: DashboardResponse['layout']['preset'],
): DashboardResponse['layout'] {
  return {
    preset,
    widgets: dashboard.layout.widgets.map((widget, index) => ({
      ...widget,
      columnSpan: preset === 'compact' ? 1 : index < 2 ? 2 : 1,
      rowSpan: 1,
    })),
  };
}
