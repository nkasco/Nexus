import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@nexus/shared';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async getStatus(): Promise<HealthResponse> {
    let databaseStatus: HealthResponse['status'] = 'ok';
    let databaseDetail = 'SQLite connection available';

    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
    } catch {
      databaseStatus = 'degraded';
      databaseDetail = 'Database connectivity check failed';
    }

    const realtimeStatus = this.realtimeService.isReady() ? 'ok' : 'degraded';

    return {
      service: 'nexus-api',
      status:
        databaseStatus === 'ok' && realtimeStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      components: [
        {
          name: 'database',
          status: databaseStatus,
          detail: databaseDetail,
        },
        {
          name: 'realtime',
          status: realtimeStatus,
          detail: `${this.realtimeService.getConnectedClients()} active websocket client(s)`,
        },
      ],
    };
  }
}
