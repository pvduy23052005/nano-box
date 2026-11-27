import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { createCorsOriginValidator } from './infrastructure/configs/cors.util';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.use(cookieParser());

  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT', '5053')) || 5053;

  app.enableCors({
    origin: createCorsOriginValidator(
      configService.get<string>('ALLOWED_ORIGINS'),
    ),
    credentials: true,
  });

  await app.listen(port);
}

void bootstrap();
