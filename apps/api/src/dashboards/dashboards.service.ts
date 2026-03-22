import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  DashboardLayout,
  DashboardResponse,
  DashboardSlug,
  DashboardWidgetLayout,
} from '@nexus/shared';
import { PrismaService } from '../prisma/prisma.service';

const DASHBOARD_NAMES: Record<DashboardSlug, string> = {
  overview: 'Overview',
  'home-lab': 'Home Lab',
  media: 'Media',
  devops: 'DevOps',
  metrics: 'Metrics',
  alerts: 'Alerts',
};

const DEFAULT_LAYOUTS: Record<DashboardSlug, DashboardLayout> = {
  overview: {
    preset: 'balanced',
    widgets: [
      {
        id: 'overview-compute',
        title: 'Compute Status',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'overview-storage',
        title: 'Storage Status',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'overview-network',
        title: 'Network Status',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'overview-media',
        title: 'Media Status',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'overview-cicd',
        title: 'CI/CD Status',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'overview-alerts',
        title: 'Attention Summary',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'overview-feed',
        title: 'Recent Activity',
        columnSpan: 2,
        rowSpan: 1,
      },
    ],
  },
  'home-lab': {
    preset: 'balanced',
    widgets: [
      {
        id: 'homelab-cluster',
        title: 'Cluster Watch',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'homelab-guests',
        title: 'Guest Runtime',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'homelab-pools',
        title: 'Pool Health',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'homelab-capacity',
        title: 'Capacity Window',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'homelab-network',
        title: 'Network Edge',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'homelab-clients',
        title: 'Client Load',
        columnSpan: 1,
        rowSpan: 1,
      },
    ],
  },
  media: {
    preset: 'balanced',
    widgets: [
      {
        id: 'media-home-entities',
        title: 'Entity Watch',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'media-home-automations',
        title: 'Automation Summary',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'media-streams',
        title: 'Active Streams',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'media-libraries',
        title: 'Library Summary',
        columnSpan: 2,
        rowSpan: 1,
      },
    ],
  },
  devops: {
    preset: 'balanced',
    widgets: [
      {
        id: 'devops-workflows',
        title: 'Workflow Pulse',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'devops-prs',
        title: 'Review Queue',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'devops-repositories',
        title: 'Repository Posture',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'devops-delivery',
        title: 'Delivery Attention',
        columnSpan: 1,
        rowSpan: 1,
      },
    ],
  },
  metrics: {
    preset: 'balanced',
    widgets: [
      {
        id: 'metrics-window',
        title: 'Live Snapshot',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'metrics-sources',
        title: 'Source Health',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'metrics-warnings',
        title: 'Warning Metrics',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'metrics-polling',
        title: 'Polling Cadence',
        columnSpan: 2,
        rowSpan: 1,
      },
    ],
  },
  alerts: {
    preset: 'balanced',
    widgets: [
      {
        id: 'alerts-summary',
        title: 'Signal Summary',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'alerts-queue',
        title: 'Attention Queue',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'alerts-history',
        title: 'Recent Activity',
        columnSpan: 1,
        rowSpan: 1,
      },
    ],
  },
};

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(slug: string): Promise<DashboardResponse> {
    const dashboardSlug = this.ensureSlug(slug);
    const dashboard = await this.prisma.dashboard.upsert({
      where: { slug: dashboardSlug },
      create: {
        slug: dashboardSlug,
        name: DASHBOARD_NAMES[dashboardSlug],
        layout: JSON.stringify(DEFAULT_LAYOUTS[dashboardSlug]),
      },
      update: {},
    });

    return {
      slug: dashboardSlug,
      name: dashboard.name,
      layout: this.parseLayout(dashboardSlug, dashboard.layout),
      updatedAt: dashboard.updatedAt.toISOString(),
    };
  }

  async updateDashboard(
    slug: string,
    layout: DashboardLayout,
  ): Promise<DashboardResponse> {
    const dashboardSlug = this.ensureSlug(slug);
    this.validateLayout(layout);

    const dashboard = await this.prisma.dashboard.upsert({
      where: { slug: dashboardSlug },
      create: {
        slug: dashboardSlug,
        name: DASHBOARD_NAMES[dashboardSlug],
        layout: JSON.stringify(layout),
      },
      update: {
        name: DASHBOARD_NAMES[dashboardSlug],
        layout: JSON.stringify(layout),
      },
    });

    return {
      slug: dashboardSlug,
      name: dashboard.name,
      layout,
      updatedAt: dashboard.updatedAt.toISOString(),
    };
  }

  private ensureSlug(slug: string): DashboardSlug {
    if (
      slug === 'overview' ||
      slug === 'home-lab' ||
      slug === 'media' ||
      slug === 'devops' ||
      slug === 'metrics' ||
      slug === 'alerts'
    ) {
      return slug;
    }

    throw new BadRequestException(`Unsupported dashboard slug: ${slug}`);
  }

  private parseLayout(
    slug: DashboardSlug,
    layout: string | null,
  ): DashboardLayout {
    if (!layout) {
      return DEFAULT_LAYOUTS[slug];
    }

    try {
      const parsed = JSON.parse(layout) as DashboardLayout;
      this.validateLayout(parsed);
      return this.normalizeLayout(slug, parsed);
    } catch {
      return DEFAULT_LAYOUTS[slug];
    }
  }

  private validateLayout(layout: DashboardLayout) {
    if (
      !layout ||
      !Array.isArray(layout.widgets) ||
      (layout.preset !== 'balanced' && layout.preset !== 'compact')
    ) {
      throw new BadRequestException('Invalid dashboard layout');
    }

    if (
      layout.widgets.some(
        (widget) =>
          !widget.id ||
          !widget.title ||
          widget.columnSpan < 1 ||
          widget.rowSpan < 1 ||
          !this.isValidWidgetSettings(widget.settings),
      )
    ) {
      throw new BadRequestException('Invalid dashboard widget definition');
    }
  }

  private normalizeLayout(
    slug: DashboardSlug,
    layout: DashboardLayout,
  ): DashboardLayout {
    const widgetById = new Map(
      layout.widgets.map((widget) => [widget.id, widget] as const),
    );

    return {
      preset: layout.preset,
      widgets: DEFAULT_LAYOUTS[slug].widgets.map((defaultWidget) =>
        this.mergeWidget(defaultWidget, widgetById.get(defaultWidget.id)),
      ),
    };
  }

  private mergeWidget(
    defaultWidget: DashboardWidgetLayout,
    storedWidget: DashboardWidgetLayout | undefined,
  ): DashboardWidgetLayout {
    if (!storedWidget) {
      return defaultWidget;
    }

    return {
      ...defaultWidget,
      columnSpan: storedWidget.columnSpan,
      rowSpan: storedWidget.rowSpan,
      settings: storedWidget.settings,
    };
  }

  private isValidWidgetSettings(settings: DashboardWidgetLayout['settings']) {
    if (!settings) {
      return true;
    }

    return settings.focus === undefined || settings.focus === 'summary' || settings.focus === 'attention';
  }
}
