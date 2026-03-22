import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type {
  IntegrationDetailResponse,
  IntegrationsOverviewResponse,
  UpdateIntegrationConfigurationRequest,
} from '@nexus/shared';
import { AuthGuard } from '../auth/auth.guard';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@UseGuards(AuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {
    this.getIntegrations = this.getIntegrations.bind(this);
    this.getIntegration = this.getIntegration.bind(this);
    this.updateIntegrationConfiguration =
      this.updateIntegrationConfiguration.bind(this);
    this.syncAll = this.syncAll.bind(this);
    this.syncIntegration = this.syncIntegration.bind(this);
  }

  @Get()
  getIntegrations(): Promise<IntegrationsOverviewResponse> {
    return this.integrationsService.listOverview();
  }

  @Get(':provider')
  getIntegration(
    @Param('provider') provider: string,
  ): Promise<IntegrationDetailResponse> {
    return this.integrationsService.getIntegration(provider);
  }

  @Patch(':provider/config')
  updateIntegrationConfiguration(
    @Param('provider') provider: string,
    @Body() updates: UpdateIntegrationConfigurationRequest,
  ): Promise<IntegrationDetailResponse> {
    return this.integrationsService.updateConfiguration(provider, updates);
  }

  @Post('sync')
  syncAll(): Promise<IntegrationsOverviewResponse> {
    return this.integrationsService.syncAll('manual');
  }

  @Post(':provider/sync')
  syncIntegration(
    @Param('provider') provider: string,
  ): Promise<IntegrationDetailResponse> {
    return this.integrationsService.syncProvider(provider, 'manual');
  }
}
