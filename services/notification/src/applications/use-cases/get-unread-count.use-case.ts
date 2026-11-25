import { NotificationRepositoryAdapter } from '../ports/notification.port';

export class GetUnreadNotificationCountUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepositoryAdapter,
  ) {}

  async execute(recipientId: string): Promise<number> {
    return this.notificationRepository.countUnreadByRecipient(recipientId);
  }
}
