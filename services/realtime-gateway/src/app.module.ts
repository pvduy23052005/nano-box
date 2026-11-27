import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { LoggerConfigService } from './infrastructure/configs/logger.config';
import { WebsocketModule } from './infrastructure/websocket/ws.module';
import { HealthController } from './presentation/rest/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      providers: [LoggerConfigService],
      inject: [LoggerConfigService],
      useFactory: (loggerConfigService: LoggerConfigService) =>
        loggerConfigService.createOptions(),
    }),
    WebsocketModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
