import { MessageType } from '../../domain/message.type';
import { MessageRepositoryAdapter } from '../ports/message.port';

export class GetMessagesUseCase {
  constructor(private readonly messageRepository: MessageRepositoryAdapter) {}

  async execute(): Promise<MessageType[]> {
    const messages = await this.messageRepository.findAll();
    return messages;
  }
}
