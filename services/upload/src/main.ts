import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'upload',
      protoPath: '../../proto/upload.proto',
      url: `${grpcHost}:${grpcPort}`,
    },
  });

  await app.startAllMicroservices();
  await app.listen(httpPort);
}

bootstrap();
