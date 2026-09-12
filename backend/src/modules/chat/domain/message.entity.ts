import { MessageType } from './message.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

export class MessageEntity {
  private id?: string;
  private senderId: string;
  private roomId: string;
  private content: string;
  private attachments: string[];
  private readBy: string[];

  private constructor(props: MessageType) {
    this.id = props.id;
    this.senderId = props.senderId;
    this.roomId = props.roomId;
    this.content = props.content || '';
    this.attachments = props.attachments || [];
    this.readBy = props.readBy || [];
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
    });
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
  public getReadBy(): string[] {
    return this.readBy;
  }
}
