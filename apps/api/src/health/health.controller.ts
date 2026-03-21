import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@nexus/shared';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {
    this.getHealth = this.getHealth.bind(this);
  }

  @Get()
  getHealth(): Promise<HealthResponse> {
    return this.healthService.getStatus();
  }
}
