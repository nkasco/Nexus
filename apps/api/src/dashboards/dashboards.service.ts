import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  DashboardLayout,
  DashboardResponse,
  DashboardSlug,
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
      {
        id: 'overview-capacity',
        title: 'Capacity Radar',
        columnSpan: 1,
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
      { id: 'homelab-power', title: 'Power Window', columnSpan: 1, rowSpan: 1 },
      {
        id: 'homelab-network',
        title: 'Network Edge',
        columnSpan: 1,
        rowSpan: 1,
      },
    ],
  },
  media: {
    preset: 'balanced',
    widgets: [
      {
        id: 'media-streams',
        title: 'Active Streams',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'media-libraries',
        title: 'Library Drift',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'media-actions',
        title: 'Automation Queue',
        columnSpan: 1,
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
      { id: 'devops-prs', title: 'Review Queue', columnSpan: 1, rowSpan: 1 },
      {
        id: 'devops-releases',
        title: 'Release Track',
        columnSpan: 1,
        rowSpan: 1,
      },
    ],
  },
  metrics: {
    preset: 'balanced',
    widgets: [
      { id: 'metrics-window', title: 'Time Window', columnSpan: 1, rowSpan: 1 },
      {
        id: 'metrics-trends',
        title: 'Trend Surface',
        columnSpan: 2,
        rowSpan: 1,
      },
      {
        id: 'metrics-sources',
        title: 'Source Health',
        columnSpan: 1,
        rowSpan: 1,
      },
    ],
  },
  alerts: {
    preset: 'balanced',
    widgets: [
      { id: 'alerts-open', title: 'Open Alerts', columnSpan: 2, rowSpan: 1 },
      {
        id: 'alerts-routing',
        title: 'Notification Routing',
        columnSpan: 1,
        rowSpan: 1,
      },
      {
        id: 'alerts-history',
        title: 'Recent State Changes',
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
      return parsed;
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
          widget.rowSpan < 1,
      )
    ) {
      throw new BadRequestException('Invalid dashboard widget definition');
    }
  }
}
