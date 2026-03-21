import { AuthController } from './auth.controller';

describe('AuthController', () => {
  it('returns the session payload resolved from the authorization header', () => {
    const getSessionFromAuthorizationHeader = vi.fn().mockReturnValue({
      user: {
        username: 'admin',
        displayName: 'Homelab Admin',
        role: 'admin' as const,
      },
      expiresAt: '2026-03-22T20:00:00.000Z',
    });
    const controller = new AuthController(
      {
        login: vi.fn(),
        getSessionFromAuthorizationHeader,
      } as never,
      {
        record: vi.fn(),
      } as never,
    );

    expect(
      controller.getSession({
        headers: {
          authorization: 'Bearer test-token',
        },
      } as never),
    ).toEqual({
      user: {
        username: 'admin',
        displayName: 'Homelab Admin',
        role: 'admin',
      },
      expiresAt: '2026-03-22T20:00:00.000Z',
    });
    expect(getSessionFromAuthorizationHeader).toHaveBeenCalledWith(
      'Bearer test-token',
    );
  });
});
