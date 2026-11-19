import {
  NotificationMetadata,
  NotificationProps,
  NotificationType,
} from './notification.type';

export class NotificationEntity {
  private id?: string;
  private recipientId: string;
  private senderId: string;
  private senderName?: string;
  private senderAvatar?: string;
  private type: NotificationType;
  private title: string;
  private content: string;
  private metadata: NotificationMetadata;
  private isRead: boolean;
  private createdAt?: Date;

  private constructor(props: NotificationProps) {
    this.id = props.id;
    this.recipientId = props.recipientId;
    this.senderId = props.senderId;
    this.senderName = props.senderName;
    this.senderAvatar = props.senderAvatar;
    this.type = props.type;
    this.title = props.title;
    this.content = props.content;
    this.metadata = props.metadata;
    this.isRead = props.isRead;
    this.createdAt = props.createdAt;
  }

  public markAsRead(): void {
    this.isRead = true;
  }

  public static create(
    props: Omit<NotificationProps, 'id' | 'isRead'>,
  ): NotificationEntity {
    return new NotificationEntity({
      ...props,
      isRead: false,
    });
  }

  public static restore(props: NotificationProps): NotificationEntity {
    return new NotificationEntity(props);
  }

  public getId(): string | undefined {
    return this.id;
  }
  public getRecipientId(): string {
    return this.recipientId;
  }
  public getSenderId(): string {
    return this.senderId;
  }
  public getSenderName(): string | undefined {
    return this.senderName;
  }
  public getSenderAvatar(): string | undefined {
    return this.senderAvatar;
  }
  public getType(): NotificationType {
    return this.type;
  }
  public getTitle(): string {
    return this.title;
  }
  public getContent(): string {
    return this.content;
  }
  public getMetadata(): NotificationMetadata {
    return this.metadata;
  }
  public getIsRead(): boolean {
    return this.isRead;
  }
  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }
}
