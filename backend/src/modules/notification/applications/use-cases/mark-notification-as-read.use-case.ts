import { NotificationRepositoryAdapter } from '../ports/notification.port';

export class MarkNotificationAsReadUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepositoryAdapter,
  ) {}

  async execute(notificationId: string, recipientId: string): Promise<boolean> {
    return this.notificationRepository.markAsRead(notificationId, recipientId);
  }
}
