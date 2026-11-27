import { Controller, Get } from '@nestjs/common';

export interface HealthCheckResponse {
  status: 'ok';
  service: 'realtime-gateway';
  timestamp: string;
}

@Controller('health')
export class HealthController {
  @Get('live')
  getLiveness(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'realtime-gateway',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  getReadiness(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'realtime-gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
