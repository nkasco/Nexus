import { describe, expect, it } from 'vitest';
import {
  getRequestedPort,
  resolveAvailablePort,
} from './dev-server.mjs';

describe('dev-server port selection', () => {
  it('defaults to port 3000 when WEB_PORT is missing or invalid', () => {
    expect(getRequestedPort({})).toBe(3000);
    expect(getRequestedPort({ WEB_PORT: '' })).toBe(3000);
    expect(getRequestedPort({ WEB_PORT: 'not-a-number' })).toBe(3000);
  });

  it('uses WEB_PORT when it is a positive integer', () => {
    expect(getRequestedPort({ WEB_PORT: '4005' })).toBe(4005);
  });

  it('finds the next available port when the requested port is occupied', async () => {
    const selectedPort = await resolveAvailablePort(3000, async (port) => port >= 3002);

    expect(selectedPort).toBe(3002);
  });
});
