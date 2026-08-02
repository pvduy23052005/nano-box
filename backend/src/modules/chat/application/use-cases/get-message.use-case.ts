import { MessageState } from '../../domain/message.type';
import { MessageRepositoryAdapter } from '../ports/message.port';

export class GetMessagesUseCase {
  constructor(private readonly messageRepository: MessageRepositoryAdapter) {}

  async execute(): Promise<MessageState[]> {
    const messages = await this.messageRepository.findAll();
    return messages;
  }
}
