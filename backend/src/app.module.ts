import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { graphqlConfig } from './configs/graphql.config';
import { MongooseConfig } from './configs/database.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { WebsocketModule } from './infrastructure/websocket/ws.module';
import { UploadModule } from './infrastructure/upload/upload.module';
import { RoomModule } from './modules/room/room.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FriendshipModule } from './modules/friendship/friendship.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req, res) => {
          const headerId = req.headers['x-request-id'];
          const existingId = Array.isArray(headerId) ? headerId[0] : headerId;
          const id =
            typeof existingId === 'string' && existingId
              ? existingId
              : (req.id as string) || randomUUID();
          if (!res.headersSent) {
            res.setHeader('x-request-id', id);
          }
          return id;
        },
        customProps: (req) => ({
          reqId: req.id,
        }),
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.confirmPassword',
          'req.body.refreshToken',
        ],
        customSuccessMessage: (req, res, responseTime) => {
          return `[${req.method}] ${req.url} -> ${res.statusCode} (${responseTime}ms)`;
        },
        customErrorMessage: (req, res, err) => {
          return `[${req.method}] ${req.url} -> ${res.statusCode} (${err.message})`;
        },
      },
    }),
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
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
