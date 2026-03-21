import { UnauthorizedException } from '@nestjs/common';
import type {
  AuthSessionResponse,
  AuthUser,
  LoginRequest,
  SessionResponse,
} from '@nexus/shared';
import { timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { signJwt, verifyJwt } from './jwt';

function secureCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

@Injectable()
export class AuthService {
  private readonly username = process.env.ADMIN_USERNAME ?? 'admin';
  private readonly password = process.env.ADMIN_PASSWORD ?? 'nexus-admin';
  private readonly displayName =
    process.env.ADMIN_DISPLAY_NAME ?? 'Homelab Admin';
  private readonly jwtSecret =
    process.env.JWT_SECRET ?? 'replace-this-development-secret';
  private readonly sessionTtlMinutes = Number(
    process.env.SESSION_TTL_MINUTES ?? 1_440,
  );

  login(credentials: LoginRequest): AuthSessionResponse {
    const normalizedUsername = credentials.username.trim();

    if (
      !secureCompare(normalizedUsername, this.username) ||
      !secureCompare(credentials.password, this.password)
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createSession();
  }

  getSessionFromAuthorizationHeader(header?: string): SessionResponse {
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    return this.getSessionFromToken(header.slice('Bearer '.length));
  }

  getSessionFromToken(token: string): SessionResponse {
    try {
      const payload = verifyJwt(token, this.jwtSecret);

      return {
        user: {
          username: payload.sub,
          displayName: payload.name,
          role: payload.role,
        },
        expiresAt: new Date(payload.exp * 1_000).toISOString(),
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  isTokenValid(token: string) {
    try {
      this.getSessionFromToken(token);
      return true;
    } catch {
      return false;
    }
  }

  private createSession(): AuthSessionResponse {
    const user: AuthUser = {
      username: this.username,
      displayName: this.displayName,
      role: 'admin',
    };
    const ttlSeconds = this.sessionTtlMinutes * 60;
    const token = signJwt(
      {
        sub: user.username,
        name: user.displayName,
        role: user.role,
      },
      this.jwtSecret,
      ttlSeconds,
    );

    return {
      token,
      user,
      expiresAt: new Date(Date.now() + ttlSeconds * 1_000).toISOString(),
    };
  }
}
