import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './infrastructure/notification.schema';
import { UserModule } from '../user/user.module';
import { NotificationRepositoryAdapter } from './applications/ports/notification.port';
import { NotificationRepository } from './infrastructure/notification.repository';
import { GetNotificationsUseCase } from './applications/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './applications/use-cases/get-unread-count.use-case';
import { MarkNotificationAsReadUseCase } from './applications/use-cases/mark-notification-as-read.use-case';
import { MarkAllNotificationsAsReadUseCase } from './applications/use-cases/mark-all-notifications-as-read.use-case';
import { CreateNotificationUseCase } from './applications/use-cases/create-notification.use-case';
import { NotificationResolver } from './presentation/graphql/notification.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    UserModule,
  ],
  providers: [
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
  exports: [
    MongooseModule,
    NotificationRepositoryAdapter,
    CreateNotificationUseCase,
    GetNotificationsUseCase,
    GetUnreadNotificationCountUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllNotificationsAsReadUseCase,
  ],
})
export class NotificationModule {}
