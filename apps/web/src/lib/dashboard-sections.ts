import type {
  DashboardResponse,
  DashboardSlug,
  HealthResponse,
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
): WidgetView[] {
  return dashboard.layout.widgets.map((widget) => {
    const presentation = widgetPresentation[widget.id];
    const healthMetric =
      widget.id === 'overview-health' && health
        ? `${health.status === 'ok' ? 'Healthy' : 'Degraded'}`
        : presentation?.metric;

    return {
      id: widget.id,
      title: widget.title,
      eyebrow: presentation?.eyebrow ?? 'Widget',
      detail:
        presentation?.detail ??
        'This widget will be wired to a future backend surface.',
      metric: healthMetric,
      state: presentation?.state ?? 'ready',
      lines: presentation?.lines,
      columnSpan: widget.columnSpan,
      rowSpan: widget.rowSpan,
    };
  });
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
