import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MessageEntity } from '../../domain/message.entity';
import { MessageType } from '../../domain/message.type';
import { MessageRepositoryAdapter } from '../ports/message.port';
import { RoomRepositoryAdapter } from '../../../room/application/ports/room.ports';

interface SendMessageOutputDto {
  message: MessageType;
  memberIds: string[];
}

export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepositoryAdapter,
    private readonly roomRepository: RoomRepositoryAdapter,
  ) {}

  async execute(messageData: MessageType): Promise<SendMessageOutputDto> {
    const room = await this.roomRepository.findById(messageData.roomId);
    if (!room) {
      throw new DomainValidationException({
        roomId: 'Phòng chat không tồn tại',
      });
    }

    const isMember = room.members?.some(
      (member) => member.userId === messageData.senderId,
    );
    if (!isMember) {
      throw new DomainValidationException({
        roomId: 'Bạn không phải thành viên của phòng này',
      });
    }

    const newMessage = MessageEntity.create(messageData);
    const savedMessage = await this.messageRepository.save(newMessage);

    if (savedMessage.id) {
      await this.roomRepository.updateLastMessageId(
        messageData.roomId,
        savedMessage.id,
      );
    }

    const memberIds = room.members.map((member) => member.userId);

    return {
      message: savedMessage,
      memberIds,
    };
  }
}
