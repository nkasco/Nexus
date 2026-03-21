import { BadRequestException } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';

describe('DashboardsService', () => {
  it('creates a default dashboard layout when one does not exist', async () => {
    const service = new DashboardsService({
      dashboard: {
        upsert: jest.fn().mockResolvedValue({
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
  });

  it('rejects invalid layout payloads', async () => {
    const service = new DashboardsService({
      dashboard: {
        upsert: jest.fn(),
      },
    } as never);

    await expect(
      service.updateDashboard('overview', {
        preset: 'balanced',
        widgets: [{ id: '', title: 'Broken', columnSpan: 0, rowSpan: 0 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
