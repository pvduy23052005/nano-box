import { MessageEntity } from '../../domain/message.entity';
import { MessageState } from '../../domain/message.type';
import { MessageRepositoryAdapter } from '../ports/message.port';

export class SendMessageUseCase {
  constructor(private readonly messageRepository: MessageRepositoryAdapter) {}
  async execute(messageData: MessageState): Promise<MessageState> {
    const newMessage = MessageEntity.create(messageData);

    return this.messageRepository.save(newMessage);
  }
}
