import { MessageType } from '../../domain/message.type';
import { PaginationResult } from '../dto/pagination.type';
import { MessageRepositoryAdapter } from '../ports/message.port';

export class GetMessagesUseCase {
  constructor(private readonly messageRepository: MessageRepositoryAdapter) {}

  async execute(
    roomId?: string,
    cursor?: string,
    limit?: number,
  ): Promise<PaginationResult<MessageType>> {
    const messages = await this.messageRepository.findAll({
      roomId,
      cursor,
      limit,
    });
    return messages;
  }
}
