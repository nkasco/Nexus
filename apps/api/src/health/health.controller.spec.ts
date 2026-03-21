import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('keeps method context when the route handler is invoked without the instance', async () => {
    const controller = new HealthController({
      getStatus: jest.fn().mockResolvedValue({
        service: 'nexus-api',
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptimeSeconds: 42,
        components: [],
      }),
    } as never);

    const { getHealth } = controller;
    const result = await getHealth();

    expect(result.service).toBe('nexus-api');
    expect(result.status).toBe('ok');
  });
});
