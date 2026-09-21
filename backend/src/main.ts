import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { GlobalGraphQLExceptionFilter } from './common/pipes/validator.pipe';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean)
    : ['http://localhost:3000', 'https://localhost', 'http://localhost'];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.trim().replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      console.warn(
        `[CORS Blocked] Origin "${origin}" không nằm trong ALLOWED_ORIGINS:`,
        allowedOrigins,
      );
      return callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalFilters(new GlobalGraphQLExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[]) =>
        validationErrors,
    }),
  );

  await app.listen(process.env.PORT || 5050);
}
void bootstrap();
