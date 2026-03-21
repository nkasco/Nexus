export type HealthStatus = 'ok';

export interface HealthResponse {
  service: string;
  status: HealthStatus;
  timestamp: string;
}
