import { MessageEntity } from '../../domain/message.entity';
import { MessageType } from '../../domain/message.type';
import { CursorPagination, PaginationResult } from '../dto/pagination.type';

export abstract class MessageRepositoryAdapter {
  abstract save(message: MessageEntity): Promise<MessageType>;

  abstract findAll(
    pagination: CursorPagination,
  ): Promise<PaginationResult<MessageType>>;
}
