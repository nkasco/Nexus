import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { NotificationListResponse } from '@nexus/shared';
import { AuthGuard } from '../auth/auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {
    this.getNotifications = this.getNotifications.bind(this);
    this.markAllRead = this.markAllRead.bind(this);
  }

  @Get()
  getNotifications(): NotificationListResponse {
    return this.notificationsService.list();
  }

  @Post('read')
  markAllRead(): NotificationListResponse {
    return this.notificationsService.markAllRead();
  }
}
