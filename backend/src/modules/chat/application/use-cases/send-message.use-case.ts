import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MessageEntity } from '../../domain/message.entity';
import { MessageType } from '../../domain/message.type';
import { MessageRepositoryAdapter } from '../ports/message.port';
import { RoomRepositoryAdapter } from '../../../room/application/ports/room.ports';
import { UploadAdapter } from '../../../upload/applications/ports/upload.port';
import { MemberStatus } from '../../../room/domain/chat.enum';

export const MAX_ATTACHMENTS_PER_MESSAGE = 10;

export interface SendMessageInputDto extends MessageType {
  tempKeys?: string[];
}

interface SendMessageOutputDto {
  message: MessageType;
  memberIds: string[];
}

export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepositoryAdapter,
    private readonly roomRepository: RoomRepositoryAdapter,
    private readonly uploadAdapter: UploadAdapter,
  ) {}

  async execute(
    messageData: SendMessageInputDto,
  ): Promise<SendMessageOutputDto> {
    const room = await this.roomRepository.findRoomMembersWithProfile(
      messageData.roomId,
    );
    if (!room) {
      throw new DomainValidationException({
        roomId: 'Phòng chat không tồn tại',
      });
    }

    const currentMember = room.members?.find(
      (member) =>
        member.userId === messageData.senderId &&
        member.status !== MemberStatus.REFUSED,
    );
    if (!currentMember) {
      throw new DomainValidationException({
        roomId: 'Bạn không phải thành viên của phòng này',
      });
    }

    const attachments: string[] = [...(messageData.attachments || [])];
    const tempKeys = messageData.tempKeys || [];

    const totalCount = attachments.length + tempKeys.length;
    if (totalCount > MAX_ATTACHMENTS_PER_MESSAGE) {
      throw new DomainValidationException({
        attachments: `Chỉ được gửi tối đa ${MAX_ATTACHMENTS_PER_MESSAGE} file đính kèm mỗi tin nhắn`,
      });
    }

    if (tempKeys.length) {
      try {
        const copyResults = await Promise.all(
          tempKeys.map((tempKey) =>
            this.uploadAdapter.copyTempToUploads(tempKey),
          ),
        );
        attachments.push(...copyResults);
      } catch (error) {
        if (error instanceof DomainValidationException) throw error;
        throw new DomainValidationException({
          attachments:
            error instanceof Error
              ? error.message
              : 'Lỗi khi xử lý file đính kèm hoặc kết nối lưu trữ quá hạn',
        });
      }
    }

    const senderAvatar = currentMember.avatar ?? null;
    const senderName = currentMember.name ?? null;

    const memberIds = (room.members || [])
      .filter((member) => member.status !== MemberStatus.REFUSED)
      .map((member) => member.userId);

    const activeMemberSet = new Set(memberIds);
    const rawMentionedIds = messageData.mentionedUserIds || [];
    const mentionedUserIds = Array.from(
      new Set(
        rawMentionedIds.filter(
          (id) =>
            typeof id === 'string' &&
            id.trim().length > 0 &&
            id !== messageData.senderId &&
            activeMemberSet.has(id),
        ),
      ),
    );

    const newMessage = MessageEntity.create({
      ...messageData,
      attachments,
      senderAvatar,
      senderName,
      mentionedUserIds,
    });
    const savedMessage = await this.messageRepository.save(newMessage);

    if (savedMessage.id) {
      await this.roomRepository.updateLastMessageId(
        messageData.roomId,
        savedMessage.id,
      );
    }

    if (tempKeys.length) {
      Promise.all(
        tempKeys.map((key) => this.uploadAdapter.deleteTempFile(key)),
      ).catch(() => {});
    }

    return {
      message: savedMessage,
      memberIds,
    };
  }
}
