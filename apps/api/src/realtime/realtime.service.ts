import type {
  RealtimeEvent,
  RealtimeEventType,
  RealtimePayloadMap,
} from '@nexus/shared';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type { Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocket, WebSocketServer } from 'ws';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class RealtimeService implements OnModuleDestroy {
  private wsServer?: WebSocketServer;
  private readonly clients = new Set<WebSocket>();
  private pulseTimer?: NodeJS.Timeout;

  constructor(private readonly authService: AuthService) {}

  attachServer(server: Server) {
    if (this.wsServer) {
      return;
    }

    this.wsServer = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      const requestUrl = new URL(request.url ?? '/', 'http://localhost');

      if (requestUrl.pathname !== '/ws') {
        return;
      }

      const token = requestUrl.searchParams.get('token');

      if (!token || !this.authService.isTokenValid(token)) {
        this.rejectUpgrade(socket);
        return;
      }

      this.wsServer?.handleUpgrade(request, socket, head, (client) => {
        this.registerClient(client);
      });
    });

    this.pulseTimer = setInterval(() => {
      this.broadcast('system.pulse', {
        connectedClients: this.clients.size,
        serverTime: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      });
    }, 15_000);
  }

  broadcast<TType extends RealtimeEventType>(
    type: TType,
    payload: RealtimePayloadMap[TType],
  ) {
    const event: RealtimeEvent = {
      type,
      payload,
      sentAt: new Date().toISOString(),
    };

    const serialized = JSON.stringify(event);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    });
  }

  isReady() {
    return Boolean(this.wsServer);
  }

  getConnectedClients() {
    return this.clients.size;
  }

  onModuleDestroy() {
    if (this.pulseTimer) {
      clearInterval(this.pulseTimer);
    }

    this.wsServer?.close();
  }

  private registerClient(client: WebSocket) {
    this.clients.add(client);

    client.on('close', () => {
      this.clients.delete(client);
    });

    const event: RealtimeEvent<RealtimePayloadMap['realtime.connected']> = {
      type: 'realtime.connected',
      payload: {
        connectedClients: this.clients.size,
      },
      sentAt: new Date().toISOString(),
    };

    client.send(JSON.stringify(event));
  }

  private rejectUpgrade(socket: Duplex) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }
}
