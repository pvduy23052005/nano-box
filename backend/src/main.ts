import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { GlobalGraphQLExceptionFilter } from './common/pipes/validator.pipe';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourproductiondomain.com'],
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Accept',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
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

  await app.listen(process.env.PORT ?? 5050);
}
void bootstrap();
