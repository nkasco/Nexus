import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type {
  AuthSessionResponse,
  LoginRequest,
  SessionResponse,
} from '@nexus/shared';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.login = this.login.bind(this);
    this.getSession = this.getSession.bind(this);
  }

  @Post('login')
  login(@Body() credentials: LoginRequest): AuthSessionResponse {
    const session = this.authService.login(credentials);

    this.notificationsService.record({
      title: 'Admin session opened',
      message: `${session.user.displayName} signed in to the dashboard shell.`,
      severity: 'success',
      source: 'system',
    });

    return session;
  }

  @Get('session')
  @UseGuards(AuthGuard)
  getSession(@Req() request: AuthenticatedRequest): SessionResponse {
    return this.authService.getSessionFromAuthorizationHeader(
      request.headers.authorization,
    );
  }
}
