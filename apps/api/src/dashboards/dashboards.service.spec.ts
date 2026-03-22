import { BadRequestException } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';

describe('DashboardsService', () => {
  it('creates a default dashboard layout when one does not exist', async () => {
    const service = new DashboardsService({
      dashboard: {
        upsert: vi.fn().mockResolvedValue({
          slug: 'overview',
          name: 'Overview',
          layout: null,
          updatedAt: new Date('2026-03-21T12:00:00.000Z'),
        }),
      },
    } as never);

    const dashboard = await service.getDashboard('overview');

    expect(dashboard.slug).toBe('overview');
    expect(dashboard.layout.widgets.length).toBeGreaterThan(0);
    expect(dashboard.layout.widgets[0]?.id).toBe('overview-compute');
  });

  it('rejects invalid layout payloads', async () => {
    const service = new DashboardsService({
      dashboard: {
        upsert: vi.fn(),
      },
    } as never);

    await expect(
      service.updateDashboard('overview', {
        preset: 'balanced',
        widgets: [{ id: '', title: 'Broken', columnSpan: 0, rowSpan: 0 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('normalizes stored layouts onto the current phase defaults', async () => {
    const service = new DashboardsService({
      dashboard: {
        upsert: vi.fn().mockResolvedValue({
          slug: 'overview',
          name: 'Overview',
          layout: JSON.stringify({
            preset: 'balanced',
            widgets: [
              {
                id: 'legacy-widget',
                title: 'Legacy Widget',
                columnSpan: 4,
                rowSpan: 1,
              },
            ],
          }),
          updatedAt: new Date('2026-03-21T12:00:00.000Z'),
        }),
      },
    } as never);

    const dashboard = await service.getDashboard('overview');

    expect(dashboard.layout.widgets[0]?.id).toBe('overview-compute');
    expect(
      dashboard.layout.widgets.some((widget) => widget.id === 'legacy-widget'),
    ).toBe(false);
  });
});
