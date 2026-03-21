import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import type { UiPreferences } from '@nexus/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AuthGuard } from '../auth/auth.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly notificationsService: NotificationsService,
    private readonly realtimeService: RealtimeService,
  ) {
    this.getPreferences = this.getPreferences.bind(this);
    this.updatePreferences = this.updatePreferences.bind(this);
  }

  @Get('ui')
  getPreferences(): Promise<UiPreferences> {
    return this.settingsService.getPreferences();
  }

  @Patch('ui')
  async updatePreferences(
    @Body() updates: Partial<UiPreferences>,
  ): Promise<UiPreferences> {
    const preferences = await this.settingsService.updatePreferences(updates);

    this.realtimeService.broadcast('settings.updated', preferences);
    this.notificationsService.record({
      title: 'Preferences saved',
      message: `Theme is now ${preferences.theme} with the ${preferences.accent} accent.`,
      severity: 'info',
      source: 'system',
    });

    return preferences;
  }
}
