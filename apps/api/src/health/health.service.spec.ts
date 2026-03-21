import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns a health payload with component detail', async () => {
    const service = new HealthService(
      {
        $queryRawUnsafe: vi.fn().mockResolvedValue([{ ok: 1 }]),
      } as never,
      {
        isReady: vi.fn().mockReturnValue(true),
        getConnectedClients: vi.fn().mockReturnValue(2),
      } as never,
    );

    const result = await service.getStatus();

    expect(result.service).toBe('nexus-api');
    expect(result.status).toBe('ok');
    expect(result.components).toHaveLength(2);
    expect(result.components[0]?.name).toBe('database');
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
  });
});
