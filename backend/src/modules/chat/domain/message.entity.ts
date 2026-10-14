import { MessageReactionType, MessageType } from './message.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

export class MessageEntity {
  private id?: string;
  private senderId: string;
  private senderAvatar?: string | null;
  private senderName?: string | null;
  private roomId: string;
  private content: string;
  private attachments: string[];
  private reactions: MessageReactionType[];
  private readBy: string[];
  private isSystem: boolean;
  private createdAt?: Date | string | null;

  private constructor(props: MessageType) {
    this.id = props.id;
    this.senderId = props.senderId;
    this.senderAvatar = props.senderAvatar ?? props.avatar ?? null;
    this.senderName = props.senderName ?? null;
    this.roomId = props.roomId;
    this.content = props.content || '';
    this.attachments = props.attachments || [];
    this.reactions = props.reactions || [];
    this.readBy = props.readBy || [];
    this.isSystem = props.isSystem ?? props.senderId === 'system';
    this.createdAt = props.createdAt ?? null;
  }

  public static create(props: Omit<MessageType, 'id'>): MessageEntity {
    const errors: Record<string, string> = {};

    if (!props.roomId?.trim()) {
      errors.roomId = 'Phòng không được để trống';
    }

    if (!props.content?.length && !props.attachments?.length) {
      errors.content = 'Nội dung hoặc file đính kèm không được để trống';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    return new MessageEntity({
      ...props,
      roomId: props.roomId.trim(),
      isSystem: props.isSystem ?? props.senderId === 'system',
    });
  }

  public addReaction(emoji: string, userId: string): void {
    const cleanEmoji = emoji?.trim();
    if (!cleanEmoji || !userId) return;

    const existingEmojiGroup = this.reactions.find(
      (reaction: MessageReactionType) => reaction.emoji === cleanEmoji,
    );
    const alreadyReactedThis = existingEmojiGroup?.userIds.includes(userId);

    this.reactions.forEach((reaction: MessageReactionType) => {
      reaction.userIds = reaction.userIds.filter((id: string) => id !== userId);
    });

    if (alreadyReactedThis) {
      this.reactions = this.reactions.filter(
        (reaction: MessageReactionType) => reaction.userIds.length > 0,
      );
      return;
    }

    if (existingEmojiGroup) {
      existingEmojiGroup.userIds.push(userId);
    } else {
      this.reactions.push({ emoji: cleanEmoji, userIds: [userId] });
    }

    this.reactions = this.reactions.filter((r) => r.userIds.length > 0);
  }

  public static restore(props: MessageType): MessageEntity {
    return new MessageEntity(props);
  }

  public getId(): string | undefined {
    return this.id;
  }
  public getSenderId(): string {
    return this.senderId;
  }
  public getRoomId(): string {
    return this.roomId;
  }
  public getContent(): string {
    return this.content;
  }
  public getAttachments(): string[] {
    return this.attachments;
  }
  public getReactions(): MessageReactionType[] {
    return this.reactions;
  }
  public getReadBy(): string[] {
    return this.readBy;
  }
  public getSenderAvatar(): string | null | undefined {
    return this.senderAvatar;
  }
  public getSenderName(): string | null | undefined {
    return this.senderName;
  }
  public getCreatedAt(): Date | string | null | undefined {
    return this.createdAt;
  }
  public getIsSystem(): boolean {
    return this.isSystem;
  }
  public toObject(): MessageType {
    return {
      id: this.id,
      senderId: this.senderId,
      senderAvatar: this.senderAvatar,
      senderName: this.senderName,
      roomId: this.roomId,
      content: this.content,
      attachments: this.attachments,
      reactions: this.reactions,
      readBy: this.readBy,
      isSystem: this.isSystem,
      createdAt: this.createdAt,
    };
  }
}
