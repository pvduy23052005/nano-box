import { MessageEntity } from '../../domain/message.entity';
import { MessageState } from '../../domain/message.type';

export abstract class MessageRepositoryAdapter {
  abstract save(message: MessageEntity): Promise<MessageState>;
  abstract findAll(): Promise<MessageState[]>;
}
