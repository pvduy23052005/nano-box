import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MessageEntity } from '../../domain/message.entity';
import { MessageType } from '../../domain/message.type';
import { MessageRepositoryAdapter } from '../ports/message.port';
import { RoomRepositoryAdapter } from '../../../room/application/ports/room.ports';

export interface SendSystemMessageInputProps {
  roomId: string;
  content: string;
  senderName?: string;
}

export interface SendSystemMessageOutputDto {
  message: MessageType;
  memberIds: string[];
}

export class SendSystemMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepositoryAdapter,
    private readonly roomRepository: RoomRepositoryAdapter,
  ) {}

  async execute(
    input: SendSystemMessageInputProps,
  ): Promise<SendSystemMessageOutputDto> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      throw new DomainValidationException({
        roomId: 'Phòng chat không tồn tại',
      });
    }

    const cleanContent = input.content?.trim();
    if (!cleanContent) {
      throw new DomainValidationException({
        content: 'Nội dung tin nhắn không được để trống',
      });
    }

    const newMessage = MessageEntity.create({
      roomId: input.roomId,
      senderId: 'system',
      senderName: input.senderName?.trim() || 'Hệ thống',
      senderAvatar: null,
      content: cleanContent,
      attachments: [],
      reactions: [],
      readBy: [],
    });

    const savedMessage = await this.messageRepository.save(newMessage);

    if (savedMessage.id) {
      await this.roomRepository.updateLastMessageId(
        input.roomId,
        savedMessage.id,
      );
    }

    const memberIds = (room.members || [])
      .map((member) => member.userId)
      .filter(Boolean);

    return {
      message: savedMessage,
      memberIds,
    };
  }
}
