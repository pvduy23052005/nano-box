import { ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { graphqlConfig } from './infrastructure/configs/graphql.config';
import { MongooseConfig } from './infrastructure/configs/database.config';
import { LoggerConfigService } from './infrastructure/configs/logger.config';
import { rabbitmqConfig } from './infrastructure/configs/rabbitmq.config';
import { redisConfig } from './infrastructure/configs/redis.config';
import { HealthController } from './infrastructure/health/health.controller';
import { RabbitmqModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { RealtimeModule } from './infrastructure/realtime/realtime.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { WebsocketModule } from './infrastructure/websocket/ws.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { FriendshipModule } from './modules/friendship/friendship.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RoomModule } from './modules/room/room.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, rabbitmqConfig],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      providers: [LoggerConfigService],
      inject: [LoggerConfigService],
      useFactory: (loggerConfigService: LoggerConfigService) =>
        loggerConfigService.createOptions(),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfig),
    RedisModule,
    RabbitmqModule,
    RealtimeModule,
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      useClass: MongooseConfig,
    }),
    WebsocketModule,
    UserModule,
    AuthModule,
    ChatModule,
    RoomModule,
    NotificationModule,
    FriendshipModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
