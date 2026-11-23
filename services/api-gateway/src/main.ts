import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GatewayEnvKey } from './common/constants/gateway.enum';
import { TRUSTED_PROXY_SUBNETS } from './common/utils/client-ip.util';
import { CorsConfigService } from './configs/cors-config.service';
import { GatewayProxyService } from './proxy/gateway-proxy.service';

const DEFAULT_PORT = 4000;

export function configureGatewayApp(app: NestExpressApplication): void {
  app.disable('x-powered-by');
  app.set('trust proxy', TRUSTED_PROXY_SUBNETS);
  app.enableShutdownHooks();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );

  const corsConfigService = app.get(CorsConfigService);
  app.enableCors(corsConfigService.createOptions());
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('ApiGateway');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));

  const configService = app.get(ConfigService);
  const port =
    Number(configService.get<string>(GatewayEnvKey.PORT)) || DEFAULT_PORT;

  configureGatewayApp(app);
  await app.init();

  const gatewayProxyService = app.get(GatewayProxyService);
  gatewayProxyService.attachWebSocketUpgrade(app.getHttpServer());

  await app.listen(port);

  logger.log(`API Gateway listening on port ${port}`);
}

if (require.main === module) {
  void bootstrap();
}
