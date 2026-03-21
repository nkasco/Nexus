import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import type {
  DashboardResponse,
  UpdateDashboardLayoutRequest,
} from '@nexus/shared';
import { AuthGuard } from '../auth/auth.guard';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeService } from '../realtime/realtime.service';
import { DashboardsService } from './dashboards.service';

@Controller('dashboards')
@UseGuards(AuthGuard)
export class DashboardsController {
  constructor(
    private readonly dashboardsService: DashboardsService,
    private readonly notificationsService: NotificationsService,
    private readonly realtimeService: RealtimeService,
  ) {
    this.getDashboard = this.getDashboard.bind(this);
    this.updateDashboard = this.updateDashboard.bind(this);
  }

  @Get(':slug')
  getDashboard(@Param('slug') slug: string): Promise<DashboardResponse> {
    return this.dashboardsService.getDashboard(slug);
  }

  @Put(':slug/layout')
  async updateDashboard(
    @Param('slug') slug: string,
    @Body() request: UpdateDashboardLayoutRequest,
  ): Promise<DashboardResponse> {
    const dashboard = await this.dashboardsService.updateDashboard(
      slug,
      request.layout,
    );

    this.realtimeService.broadcast('dashboard.updated', dashboard);
    this.notificationsService.record({
      title: `${dashboard.name} layout saved`,
      message: `Stored the ${dashboard.layout.preset} layout preset for ${dashboard.name}.`,
      severity: 'info',
      source: 'dashboard',
    });

    return dashboard;
  }
}
