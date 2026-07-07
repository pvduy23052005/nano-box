import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { GraphQLValidationPipe } from './common/pipes/validator.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(GraphQLValidationPipe);
  await app.listen(process.env.PORT ?? 5050);
}
void bootstrap();
