import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { graphqlConfig } from './infrastructure/configs/graphql.config';
import { MongooseConfig } from './infrastructure/configs/database.config';
import { LoggerConfigService } from './infrastructure/configs/logger.config';
import { redisConfig } from './infrastructure/configs/redis.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { WebsocketModule } from './infrastructure/websocket/ws.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RoomModule } from './modules/room/room.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FriendshipModule } from './modules/friendship/friendship.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
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
  controllers: [],
  providers: [],
})
export class AppModule {}
