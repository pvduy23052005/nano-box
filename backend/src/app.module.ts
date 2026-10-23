import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { graphqlConfig } from './configs/graphql.config';
import { MongooseConfig } from './configs/database.config';
import { loggerConfig } from './configs/logger.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { WebsocketModule } from './infrastructure/websocket/ws.module';
import { UploadModule } from './infrastructure/upload/upload.module';
import { RoomModule } from './modules/room/room.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FriendshipModule } from './modules/friendship/friendship.module';

@Module({
  imports: [
    LoggerModule.forRoot(loggerConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      useClass: MongooseConfig,
    }),
    WebsocketModule,
    UploadModule,
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
