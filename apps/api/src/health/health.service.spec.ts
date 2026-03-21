import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns a healthy status payload', () => {
    const service = new HealthService();

    const result = service.getStatus();

    expect(result.service).toBe('nexus-api');
    expect(result.status).toBe('ok');
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
  });
});
