import {
  NotificationPaginationResult,
  NotificationRepositoryAdapter,
} from '../ports/notification.port';

export class GetNotificationsUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepositoryAdapter,
  ) {}

  async execute(
    recipientId: string,
    limit?: number,
    cursor?: string,
  ): Promise<NotificationPaginationResult> {
    return this.notificationRepository.findByRecipientWithPagination({
      recipientId,
      limit,
      cursor,
    });
  }
}
