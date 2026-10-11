import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MessageType } from '../../domain/message.type';
import { MessageRepositoryAdapter } from '../ports/message.port';
import { RoomRepositoryAdapter } from '../../../room/application/ports/room.ports';

export interface AddEmojiMessageInputDto {
  messageId: string;
  emoji: string;
  userId: string;
}

export interface AddEmojiMessageOutputDto {
  message: MessageType;
  memberIds: string[];
  reactorName?: string | null;
  reactorAvatar?: string | null;
}

export class AddEmojiMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepositoryAdapter,
    private readonly roomRepository: RoomRepositoryAdapter,
  ) {}

  async execute(
    input: AddEmojiMessageInputDto,
  ): Promise<AddEmojiMessageOutputDto> {
    const errors: Record<string, string> = {};

    const cleanMessageId = input.messageId?.trim();
    const cleanEmoji = input.emoji?.trim();
    const cleanUserId = input.userId?.trim();

    if (!cleanMessageId) {
      errors.messageId = 'ID tin nhắn không được để trống';
    }
    if (!cleanEmoji) {
      errors.emoji = 'Emoji không được để trống';
    }
    if (!cleanUserId) {
      errors.userId = 'Người dùng không hợp lệ';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    const message = await this.messageRepository.findById(cleanMessageId);
    if (!message) {
      throw new DomainValidationException({
        messageId: 'Tin nhắn không tồn tại',
      });
    }

    const room = await this.roomRepository.findById(message.getRoomId());
    if (!room) {
      throw new DomainValidationException({
        roomId: 'Phòng chat không tồn tại',
      });
    }

    const currentMember = room.members?.find(
      (member) => member.userId === cleanUserId,
    );
    if (!currentMember) {
      throw new DomainValidationException({
        permission: 'Bạn không phải thành viên của phòng này',
      });
    }

    message.addReaction(cleanEmoji, cleanUserId);

    const updatedMessage = await this.messageRepository.update(message);
    const memberIds = room.members.map((member) => member.userId);

    return {
      message: updatedMessage,
      memberIds,
      reactorName: currentMember.name ?? null,
      reactorAvatar: currentMember.avatar ?? null,
    };
  }
}
