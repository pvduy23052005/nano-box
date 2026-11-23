import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { FriendshipEntity } from '../friendship.entity';
import { FriendshipStatus } from '../friendship.type';

describe('FriendshipEntity', () => {
  const userA = 'user-a-id';
  const userB = 'user-b-id';
  const userC = 'user-c-id';

  describe('create', () => {
    it('nên tạo thành công thực thể với trạng thái PENDING', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      expect(friendship.getRequesterId()).toBe(userA);
      expect(friendship.getAddresseeId()).toBe(userB);
      expect(friendship.getStatus()).toBe(FriendshipStatus.PENDING);
      expect(friendship.isPending()).toBe(true);
      expect(friendship.isAccepted()).toBe(false);
      expect(friendship.getOtherUserId(userA)).toBe(userB);
      expect(friendship.getOtherUserId(userB)).toBe(userA);
    });

    it('nên ném lỗi khi người gửi rỗng', () => {
      expect(() => FriendshipEntity.create('', userB)).toThrow(
        DomainValidationException,
      );
    });

    it('nên ném lỗi khi người nhận rỗng', () => {
      expect(() => FriendshipEntity.create(userA, '')).toThrow(
        DomainValidationException,
      );
    });

    it('nên ném lỗi khi tự gửi lời mời cho chính mình', () => {
      expect(() => FriendshipEntity.create(userA, userA)).toThrow(
        DomainValidationException,
      );
    });
  });

  describe('accept', () => {
    it('nên cho phép người nhận (addressee) chấp nhận lời mời', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      friendship.accept(userB);
      expect(friendship.getStatus()).toBe(FriendshipStatus.ACCEPTED);
      expect(friendship.isAccepted()).toBe(true);
      expect(friendship.isPending()).toBe(false);
    });

    it('nên ném lỗi nếu người khác không phải addressee cố chấp nhận', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      expect(() => friendship.accept(userA)).toThrow(DomainValidationException);
      expect(() => friendship.accept(userC)).toThrow(DomainValidationException);
    });

    it('nên ném lỗi nếu lời mời không ở trạng thái PENDING', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      friendship.accept(userB);
      expect(() => friendship.accept(userB)).toThrow(DomainValidationException);
    });
  });

  describe('reject', () => {
    it('nên cho phép người nhận (addressee) từ chối lời mời', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      friendship.reject(userB);
      expect(friendship.getStatus()).toBe(FriendshipStatus.REJECTED);
      expect(friendship.isPending()).toBe(false);
    });

    it('nên ném lỗi nếu người khác từ chối', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      expect(() => friendship.reject(userA)).toThrow(DomainValidationException);
    });
  });

  describe('cancel', () => {
    it('nên cho phép người gửi (requester) hủy lời mời', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      friendship.cancel(userA);
      expect(friendship.getStatus()).toBe(FriendshipStatus.CANCELLED);
    });

    it('nên ném lỗi nếu người nhận cố hủy lời mời', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      expect(() => friendship.cancel(userB)).toThrow(DomainValidationException);
    });
  });

  describe('resend', () => {
    it('nên cho phép gửi lại lời mời khi trạng thái là CANCELLED', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      friendship.cancel(userA);
      expect(friendship.getStatus()).toBe(FriendshipStatus.CANCELLED);

      friendship.resend(userB, userA);
      expect(friendship.getStatus()).toBe(FriendshipStatus.PENDING);
      expect(friendship.getRequesterId()).toBe(userB);
      expect(friendship.getAddresseeId()).toBe(userA);
    });

    it('nên cho phép gửi lại lời mời khi trạng thái là REJECTED', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      friendship.reject(userB);
      expect(friendship.getStatus()).toBe(FriendshipStatus.REJECTED);

      friendship.resend(userA, userB);
      expect(friendship.getStatus()).toBe(FriendshipStatus.PENDING);
      expect(friendship.getRequesterId()).toBe(userA);
      expect(friendship.getAddresseeId()).toBe(userB);
    });

    it('nên ném lỗi nếu gửi lại khi lời mời vẫn đang PENDING hoặc ACCEPTED', () => {
      const pendingFriendship = FriendshipEntity.create(userA, userB);
      expect(() => pendingFriendship.resend(userA, userB)).toThrow(
        DomainValidationException,
      );

      const acceptedFriendship = FriendshipEntity.create(userA, userB);
      acceptedFriendship.accept(userB);
      expect(() => acceptedFriendship.resend(userA, userB)).toThrow(
        DomainValidationException,
      );
    });

    it('nên ném lỗi nếu tự gửi lại cho chính mình', () => {
      const friendship = FriendshipEntity.create(userA, userB);
      friendship.cancel(userA);
      expect(() => friendship.resend(userA, userA)).toThrow(
        DomainValidationException,
      );
    });
  });
});
