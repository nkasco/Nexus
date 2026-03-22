import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import type {
  NotificationSettings,
  OperatorPreferences,
  SettingsOverviewResponse,
  UiPreferences,
  UpdateNotificationSettingsRequest,
} from '@nexus/shared';
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
    this.getSettingsOverview = this.getSettingsOverview.bind(this);
    this.getPreferences = this.getPreferences.bind(this);
    this.updatePreferences = this.updatePreferences.bind(this);
    this.getOperatorPreferences = this.getOperatorPreferences.bind(this);
    this.updateOperatorPreferences = this.updateOperatorPreferences.bind(this);
    this.getNotificationSettings = this.getNotificationSettings.bind(this);
    this.updateNotificationSettings =
      this.updateNotificationSettings.bind(this);
  }

  @Get()
  getSettingsOverview(): Promise<SettingsOverviewResponse> {
    return this.settingsService.getSettingsOverview();
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

  @Get('operator')
  getOperatorPreferences(): Promise<OperatorPreferences> {
    return this.settingsService.getOperatorPreferences();
  }

  @Patch('operator')
  async updateOperatorPreferences(
    @Body() updates: Partial<OperatorPreferences>,
  ): Promise<OperatorPreferences> {
    const preferences =
      await this.settingsService.updateOperatorPreferences(updates);

    this.notificationsService.record({
      title: 'Operator settings saved',
      message: `Default landing page is now ${preferences.defaultLandingSection}.`,
      severity: 'info',
      source: 'system',
    });

    return preferences;
  }

  @Get('notifications')
  getNotificationSettings(): Promise<NotificationSettings> {
    return this.settingsService.getNotificationSettings();
  }

  @Patch('notifications')
  async updateNotificationSettings(
    @Body() updates: UpdateNotificationSettingsRequest,
  ): Promise<NotificationSettings> {
    const settings =
      await this.settingsService.updateNotificationSettings(updates);

    this.notificationsService.record({
      title: 'Notification settings saved',
      message: `${settings.defaultChannel} is the current default route for future alert delivery.`,
      severity: 'info',
      source: 'system',
    });

    return settings;
  }
}
