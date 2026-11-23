import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './infrastructure/pipes/global-exception.pipe';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[]) =>
        validationErrors,
    }),
  );

  const configService = app.get(ConfigService);

  app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const httpPort = configService.get<number>('PORT', 5051);
  const grpcPort = configService.get<number>('GRPC_PORT', 50052);
  const grpcHost = configService.get<string>('GRPC_HOST', '0.0.0.0');

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: 'upload',
        protoPath: '../../proto/upload.proto',
        url: `${grpcHost}:${grpcPort}`,
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(httpPort);
}

void bootstrap();
