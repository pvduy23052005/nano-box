import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import type { Request, Response } from 'express';
import { LoggerModule } from 'nestjs-pino';
import { NotificationRepositoryAdapter } from './applications/ports/notification.port';
import { CreateNotificationUseCase } from './applications/use-cases/create-notification.use-case';
import { GetNotificationsUseCase } from './applications/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './applications/use-cases/get-unread-count.use-case';
import { MarkAllNotificationsAsReadUseCase } from './applications/use-cases/mark-all-notifications-as-read.use-case';
import { MarkNotificationAsReadUseCase } from './applications/use-cases/mark-notification-as-read.use-case';
import { MongooseConfig } from './infrastructure/configs/database.config';
import { LoggerConfigService } from './infrastructure/configs/logger.config';
import { NotificationRepository } from './infrastructure/databases/repositories/notification.repository';
import {
  Notification,
  NotificationSchema,
} from './infrastructure/databases/schemas/notification.schema';
import { NotificationResolver } from './presentation/graphql/notification.resolver';
import { NotificationGrpcController } from './presentation/grpc/notification-grpc.controller';
import { AuthGuard } from './presentation/guards/auth.guard';
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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/notifications/graphql',
      sortSchema: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfig,
    }),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [HealthController, NotificationGrpcController],
  providers: [
    AuthGuard,
    NotificationResolver,
    {
      provide: NotificationRepositoryAdapter,
      useClass: NotificationRepository,
    },
    {
      provide: CreateNotificationUseCase,
      useFactory: (repo: NotificationRepositoryAdapter) =>
        new CreateNotificationUseCase(repo),
      inject: [NotificationRepositoryAdapter],
    },
    {
      provide: GetNotificationsUseCase,
      useFactory: (repo: NotificationRepositoryAdapter) =>
        new GetNotificationsUseCase(repo),
      inject: [NotificationRepositoryAdapter],
    },
    {
      provide: GetUnreadNotificationCountUseCase,
      useFactory: (repo: NotificationRepositoryAdapter) =>
        new GetUnreadNotificationCountUseCase(repo),
      inject: [NotificationRepositoryAdapter],
    },
    {
      provide: MarkNotificationAsReadUseCase,
      useFactory: (repo: NotificationRepositoryAdapter) =>
        new MarkNotificationAsReadUseCase(repo),
      inject: [NotificationRepositoryAdapter],
    },
    {
      provide: MarkAllNotificationsAsReadUseCase,
      useFactory: (repo: NotificationRepositoryAdapter) =>
        new MarkAllNotificationsAsReadUseCase(repo),
      inject: [NotificationRepositoryAdapter],
    },
  ],
})
export class AppModule {}
