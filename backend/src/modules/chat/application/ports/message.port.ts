import { MessageEntity } from '../../domain/message.entity';
import { MessageType } from '../../domain/message.type';

export abstract class MessageRepositoryAdapter {
  abstract save(message: MessageEntity): Promise<MessageType>;

  abstract findAll(): Promise<MessageType[]>;
}
