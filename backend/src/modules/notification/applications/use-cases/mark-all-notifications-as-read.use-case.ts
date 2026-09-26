import { NotificationRepositoryAdapter } from '../ports/notification.port';

export class MarkAllNotificationsAsReadUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepositoryAdapter,
  ) {}

  async execute(recipientId: string): Promise<boolean> {
    return this.notificationRepository.markAllAsRead(recipientId);
  }
}
