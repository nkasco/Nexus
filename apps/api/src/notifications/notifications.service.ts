import { Injectable } from '@nestjs/common';
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationSeverity,
} from '@nexus/shared';
import { randomUUID } from 'node:crypto';
import { RealtimeService } from '../realtime/realtime.service';

interface NotificationInput {
  title: string;
  message: string;
  severity: NotificationSeverity;
  source: NotificationItem['source'];
}

@Injectable()
export class NotificationsService {
  private readonly items: NotificationItem[] = [
    {
      id: randomUUID(),
      title: 'Nexus API online',
      message:
        'Phase 1 platform services are ready for the authenticated shell.',
      severity: 'success',
      source: 'system',
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: randomUUID(),
      title: 'Realtime transport standing by',
      message: 'WebSocket clients will receive pulses and notification events.',
      severity: 'info',
      source: 'realtime',
      createdAt: new Date().toISOString(),
      read: false,
    },
  ];

  constructor(private readonly realtimeService: RealtimeService) {}

  list(): NotificationListResponse {
    return {
      items: [...this.items],
      unreadCount: this.items.filter((item) => !item.read).length,
    };
  }

  markAllRead(): NotificationListResponse {
    this.items.forEach((item) => {
      item.read = true;
    });

    return this.list();
  }

  record(input: NotificationInput): NotificationItem {
    const item: NotificationItem = {
      id: randomUUID(),
      title: input.title,
      message: input.message,
      severity: input.severity,
      source: input.source,
      createdAt: new Date().toISOString(),
      read: false,
    };

    this.items.unshift(item);
    this.items.splice(12);
    this.realtimeService.broadcast('notification.created', item);

    return item;
  }
}
