import { NotificationRepositoryAdapter } from '../ports/notification.port';
import { NotificationEntity } from '../../domain/notification.entity';
import {
  NotificationMetadata,
  NotificationProps,
  NotificationType,
} from '../../domain/notification.type';

export interface CreateNotificationDto {
  recipientId: string;
  senderId: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata: NotificationMetadata;
}

export class CreateNotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepositoryAdapter,
  ) {}

  async execute(dto: CreateNotificationDto): Promise<NotificationProps> {
    const notification = NotificationEntity.create(dto);
    return await this.notificationRepository.save(notification);
  }
}
