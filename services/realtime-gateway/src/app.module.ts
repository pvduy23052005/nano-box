import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { LoggerConfigService } from './infrastructure/configs/logger.config';
import { rabbitmqConfig } from './infrastructure/configs/rabbitmq.config';
import { RabbitmqModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { WebsocketModule } from './infrastructure/websocket/ws.module';
import { RealtimeEventsConsumer } from './presentation/consumer/realtime-events.consumer';
import { HealthController } from './presentation/rest/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      load: [rabbitmqConfig],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      providers: [LoggerConfigService],
      inject: [LoggerConfigService],
      useFactory: (loggerConfigService: LoggerConfigService) =>
        loggerConfigService.createOptions(),
    }),
    RabbitmqModule,
    WebsocketModule,
  ],
  controllers: [HealthController],
  providers: [RealtimeEventsConsumer],
})
export class AppModule {}
