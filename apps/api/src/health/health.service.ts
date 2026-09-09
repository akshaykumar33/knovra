import { Injectable } from '@nestjs/common';
import { HealthResponse } from '@knovra/contracts';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'knovra-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      details: {
        database: { status: 'ok', message: 'Configured' },
        redis: { status: 'ok', message: 'Configured' },
        neo4j: { status: 'ok', message: 'Configured' },
      },
    };
  }
}
