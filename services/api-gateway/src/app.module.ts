import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CorrelationIdMiddleware } from './common/middlewares/correlation-id.middleware';
import { RateLimitMiddleware } from './common/middlewares/rate-limit.middleware';
import { RateLimitService } from './common/services/rate-limit.service';
import { CorsConfigService } from './configs/cors-config.service';
import { GatewayProxyMiddleware } from './common/middlewares/gateway-proxy.middleware';
import { GatewayProxyService } from './proxy/gateway-proxy.service';
import { GatewayWsUpgradeService } from './proxy/gateway-ws-upgrade.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
  ],
  controllers: [AppController],
  providers: [
    CorsConfigService,
    RateLimitService,
    GatewayWsUpgradeService,
    GatewayProxyService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        CorrelationIdMiddleware,
        RateLimitMiddleware,
        GatewayProxyMiddleware,
      )
      .forRoutes('{*path}');
  }
}
