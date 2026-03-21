import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const session = this.authService.getSessionFromAuthorizationHeader(
      typeof authorization === 'string' ? authorization : undefined,
    );

    request.user = session.user;
    request.nexusSession = session;
    return true;
  }
}
