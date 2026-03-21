export type HealthStatus = 'ok' | 'degraded';

export interface HealthComponent {
  name: string;
  status: HealthStatus;
  detail: string;
}

export interface HealthResponse {
  service: string;
  status: HealthStatus;
  timestamp: string;
  uptimeSeconds: number;
  components: HealthComponent[];
}
