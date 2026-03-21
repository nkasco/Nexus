import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { DashboardsController } from './dashboards/dashboards.controller';
import { DashboardsService } from './dashboards/dashboards.service';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { IntegrationsController } from './integrations/integrations.controller';
import { IntegrationsService } from './integrations/integrations.service';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeService } from './realtime/realtime.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AuthController,
    DashboardsController,
    HealthController,
    IntegrationsController,
    NotificationsController,
    SettingsController,
  ],
  providers: [
    AuthGuard,
    AuthService,
    DashboardsService,
    HealthService,
    IntegrationsService,
    NotificationsService,
    RealtimeService,
    SettingsService,
  ],
})
export class AppModule {}
