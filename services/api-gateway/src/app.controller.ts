import { Controller, Get } from '@nestjs/common';
import { GatewayServiceName } from './common/constants/gateway.enum';

export interface HealthCheckResponse {
  status: string;
  service: GatewayServiceName;
  timestamp: string;
}

@Controller()
export class AppController {
  @Get('health')
  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      service: GatewayServiceName.API_GATEWAY,
      timestamp: new Date().toISOString(),
    };
  }
}
