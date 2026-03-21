import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const originalEnvironment = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnvironment,
      ADMIN_USERNAME: 'operator',
      ADMIN_PASSWORD: 'super-secret',
      ADMIN_DISPLAY_NAME: 'Primary Operator',
      JWT_SECRET: 'test-secret',
      SESSION_TTL_MINUTES: '60',
    };
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it('creates a session for valid credentials', () => {
    const service = new AuthService();

    const session = service.login({
      username: 'operator',
      password: 'super-secret',
    });

    expect(session.user.displayName).toBe('Primary Operator');
    expect(session.token).toContain('.');
    expect(service.getSessionFromToken(session.token).user.username).toBe(
      'operator',
    );
  });

  it('rejects invalid credentials', () => {
    const service = new AuthService();

    expect(() =>
      service.login({
        username: 'operator',
        password: 'incorrect',
      }),
    ).toThrow(UnauthorizedException);
  });
});
