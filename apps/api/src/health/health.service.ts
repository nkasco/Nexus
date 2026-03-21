import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@nexus/shared';

@Injectable()
export class HealthService {
  getStatus(): HealthResponse {
    return {
      service: 'nexus-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
