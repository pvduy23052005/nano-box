import { MessageEntity } from '../../domain/message.entity';
import { MessageType } from '../../domain/message.type';
import { MessageRepositoryAdapter } from '../ports/message.port';

export class SendMessageUseCase {
  constructor(private readonly messageRepository: MessageRepositoryAdapter) {}
  async execute(messageData: MessageType): Promise<MessageType> {
    const newMessage = MessageEntity.create(messageData);

    return this.messageRepository.save(newMessage);
  }
}
