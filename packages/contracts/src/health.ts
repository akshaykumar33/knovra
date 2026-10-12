export type ServiceStatus = 'ok' | 'degraded' | 'down';

export interface HealthResponse {
  status: ServiceStatus;
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  details?: Record<string, {
    status: ServiceStatus;
    latencyMs?: number;
    message?: string;
  }>;
}
