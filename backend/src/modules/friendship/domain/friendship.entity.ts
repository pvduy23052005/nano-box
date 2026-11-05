import { FriendshipProps, FriendshipStatus } from './friendship.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

export class FriendshipEntity {
  private id?: string;
  private requesterId: string;
  private addresseeId: string;
  private status: FriendshipStatus;
  private createdAt?: Date;
  private updatedAt?: Date;

  private constructor(props: FriendshipProps) {
    this.id = props.id;
    this.requesterId = props.requesterId;
    this.addresseeId = props.addresseeId;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(
    requesterId: string,
    addresseeId: string,
  ): FriendshipEntity {
    const errors: Record<string, string> = {};
    if (!requesterId) {
      errors.requesterId = 'Người gửi không được để trống';
    }
    if (!addresseeId) {
      errors.addresseeId = 'Người nhận không được để trống';
    }
    if (requesterId === addresseeId) {
      errors.addresseeId = 'Không thể gửi lời mời cho chính mình';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    return new FriendshipEntity({
      requesterId,
      addresseeId,
      status: FriendshipStatus.PENDING,
    });
  }

  public static restore(props: FriendshipProps): FriendshipEntity {
    return new FriendshipEntity(props);
  }

  public accept(actorId: string): void {
    const errors: Record<string, string> = {};
    if (actorId !== this.addresseeId) {
      errors.addresseeId = 'Không có quyền chấp nhận lời mời kết bạn này';
    }
    if (this.status !== FriendshipStatus.PENDING) {
      errors.status =
        'Không thể chấp nhận lời mời đã kết thúc hoặc không ở trạng thái chờ';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }
    this.status = FriendshipStatus.ACCEPTED;
  }

  public reject(actorId: string): void {
    const errors: Record<string, string> = {};
    if (actorId !== this.addresseeId) {
      errors.addresseeId = 'Không có quyền từ chối lời mời này';
    }
    if (this.status !== FriendshipStatus.PENDING) {
      errors.status = 'Lời mời này không còn ở trạng thái chờ phản hồi';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }
    this.status = FriendshipStatus.REJECTED;
  }

  public cancel(actorId: string): void {
    const errors: Record<string, string> = {};
    if (actorId !== this.requesterId) {
      errors.requesterId = 'Không có quyền hủy lời mời này';
    }
    if (this.status !== FriendshipStatus.PENDING) {
      errors.status = 'Chỉ có thể hủy lời mời khi đối phương chưa phản hồi';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    this.status = FriendshipStatus.CANCELLED;
  }

  public resend(requesterId: string, addresseeId: string): void {
    const errors: Record<string, string> = {};
    if (
      this.status !== FriendshipStatus.REJECTED &&
      this.status !== FriendshipStatus.CANCELLED
    ) {
      errors.status =
        'Chỉ có thể gửi lại lời mời khi lời mời trước đó đã bị hủy hoặc từ chối';
    }
    if (!requesterId) {
      errors.requesterId = 'Người gửi không được để trống';
    }
    if (!addresseeId) {
      errors.addresseeId = 'Người nhận không được để trống';
    }
    if (requesterId === addresseeId) {
      errors.addresseeId = 'Không thể gửi lời mời cho chính mình';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    this.requesterId = requesterId;
    this.addresseeId = addresseeId;
    this.status = FriendshipStatus.PENDING;
  }

  public getId(): string | undefined {
    return this.id;
  }
  public getRequesterId(): string {
    return this.requesterId;
  }
  public getAddresseeId(): string {
    return this.addresseeId;
  }
  public getStatus(): FriendshipStatus {
    return this.status;
  }
  public isAccepted(): boolean {
    return this.status === FriendshipStatus.ACCEPTED;
  }
  public isPending(): boolean {
    return this.status === FriendshipStatus.PENDING;
  }
  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }
  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public getOtherUserId(currentUserId: string): string {
    return currentUserId === this.requesterId
      ? this.addresseeId
      : this.requesterId;
  }
}
