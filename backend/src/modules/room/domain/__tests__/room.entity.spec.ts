import { RoomEntity } from '../room.entity';
import { MemberRole, MemberStatus, RoomType } from '../chat.enum';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

describe('RoomEntity', () => {
  describe('createSingleRoom', () => {
    it('should create a single room with creator accepted and partner waiting', () => {
      const room = RoomEntity.createSingleRoom('user-1', 'user-2');

      expect(room.getTypeRoom()).toBe(RoomType.SINGLE);
      expect(room.getTitle()).toBeNull();
      expect(room.getAvatar()).toBeNull();
      expect(room.getLastMessageId()).toBeNull();
      expect(room.getId()).toBeUndefined();

      const members = room.getMembers();
      expect(members).toHaveLength(2);

      const creator = members.find((m) => m.getUserId() === 'user-1');
      expect(creator).toBeDefined();
      expect(creator?.getRole()).toBe(MemberRole.MEMBER);
      expect(creator?.getStatus()).toBe(MemberStatus.ACCEPTED);

      const partner = members.find((m) => m.getUserId() === 'user-2');
      expect(partner).toBeDefined();
      expect(partner?.getRole()).toBe(MemberRole.MEMBER);
      expect(partner?.getStatus()).toBe(MemberStatus.WAITTING);
    });

    it('should throw DomainValidationException if myId is missing', () => {
      expect(() => RoomEntity.createSingleRoom('', 'user-2')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw DomainValidationException if memberId is missing', () => {
      expect(() => RoomEntity.createSingleRoom('user-1', '')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw DomainValidationException if myId equals memberId (self-chat)', () => {
      expect(() => RoomEntity.createSingleRoom('user-1', 'user-1')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw DomainValidationException with multiple errors if both IDs are missing', () => {
      try {
        RoomEntity.createSingleRoom('', '');
        fail('Should have thrown DomainValidationException');
      } catch (err) {
        expect(err).toBeInstanceOf(DomainValidationException);
        const domainErr = err as DomainValidationException;
        expect(domainErr.errors.myId).toBeDefined();
        expect(domainErr.errors.memberId).toBeDefined();
      }
    });
  });

  describe('createFriendRoom', () => {
    it('should create a friend room with both members accepted', () => {
      const room = RoomEntity.createFriendRoom('user-1', 'user-2');

      expect(room.getTypeRoom()).toBe(RoomType.SINGLE);
      const members = room.getMembers();
      expect(members).toHaveLength(2);
      expect(members[0].getStatus()).toBe(MemberStatus.ACCEPTED);
      expect(members[1].getStatus()).toBe(MemberStatus.ACCEPTED);
    });

    it('should throw DomainValidationException if user1Id or user2Id is missing', () => {
      expect(() => RoomEntity.createFriendRoom('', 'user-2')).toThrow(
        DomainValidationException,
      );
      expect(() => RoomEntity.createFriendRoom('user-1', '')).toThrow(
        DomainValidationException,
      );
    });
  });

  describe('createGroupRoom', () => {
    it('should create a group room with creator as SUPER_ADMIN and unique members', () => {
      const room = RoomEntity.createGroupRoom(
        'creator-1',
        '  Awesome Team  ',
        ['user-2', 'user-3', 'user-2', 'creator-1'],
        'https://example.com/avatar.jpg',
      );

      expect(room.getTypeRoom()).toBe(RoomType.GROUP);
      expect(room.getTitle()).toBe('Awesome Team');
      expect(room.getAvatar()).toBe('https://example.com/avatar.jpg');

      const members = room.getMembers();
      expect(members).toHaveLength(3); // creator + 2 unique members

      const superAdmin = room.getMember('creator-1');
      expect(superAdmin?.getRole()).toBe(MemberRole.SUPER_ADMIN);
      expect(superAdmin?.getStatus()).toBe(MemberStatus.ACCEPTED);

      expect(room.isMember('user-2')).toBe(true);
      expect(room.isMember('user-3')).toBe(true);
    });

    it('should throw DomainValidationException if creatorId is missing', () => {
      expect(() =>
        RoomEntity.createGroupRoom('', 'Team', ['user-2', 'user-3']),
      ).toThrow(DomainValidationException);
    });

    it('should throw DomainValidationException if title is empty', () => {
      expect(() =>
        RoomEntity.createGroupRoom('creator-1', '   ', ['user-2', 'user-3']),
      ).toThrow(DomainValidationException);
    });

    it('should throw DomainValidationException if fewer than 2 other members are provided', () => {
      expect(() =>
        RoomEntity.createGroupRoom('creator-1', 'Team', ['user-2']),
      ).toThrow(DomainValidationException);
    });
  });

  describe('membership & admin checks', () => {
    it('isMember should return true only for accepted members', () => {
      const room = RoomEntity.createSingleRoom('user-1', 'user-2');
      expect(room.isMember('user-1')).toBe(true);
      expect(room.isMember('user-2')).toBe(false); // Waiting
      expect(room.isMember('user-999')).toBe(false);
    });

    it('isAdmin should return true for ADMIN or SUPER_ADMIN and false for normal MEMBER', () => {
      const room = RoomEntity.createGroupRoom('creator-1', 'Team', [
        'user-2',
        'user-3',
      ]);
      expect(room.isAdmin('creator-1')).toBe(true);
      expect(room.isAdmin('user-2')).toBe(false);
    });
  });

  describe('updateGroupProfile', () => {
    let groupRoom: RoomEntity;

    beforeEach(() => {
      groupRoom = RoomEntity.createGroupRoom('creator-1', 'Initial Name', [
        'user-2',
        'user-3',
      ]);
    });

    it('should update title and avatar when invoked by admin/creator', () => {
      groupRoom.updateGroupProfile(
        'creator-1',
        'New Name',
        'https://new-avatar.jpg',
      );
      expect(groupRoom.getTitle()).toBe('New Name');
      expect(groupRoom.getAvatar()).toBe('https://new-avatar.jpg');
    });

    it('should throw if room is not GROUP', () => {
      const singleRoom = RoomEntity.createSingleRoom('user-1', 'user-2');
      expect(() => singleRoom.updateGroupProfile('user-1', 'New Name')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if updater is not a member', () => {
      expect(() =>
        groupRoom.updateGroupProfile('stranger', 'New Name'),
      ).toThrow(DomainValidationException);
    });

    it('should throw if updater is a member but not admin', () => {
      expect(() => groupRoom.updateGroupProfile('user-2', 'New Name')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if neither title nor avatar is provided', () => {
      expect(() =>
        groupRoom.updateGroupProfile('creator-1', undefined, undefined),
      ).toThrow(DomainValidationException);
    });

    it('should throw if title is empty or exceeds 100 characters', () => {
      expect(() => groupRoom.updateGroupProfile('creator-1', '   ')).toThrow(
        DomainValidationException,
      );

      expect(() =>
        groupRoom.updateGroupProfile('creator-1', 'a'.repeat(101)),
      ).toThrow(DomainValidationException);
    });
  });

  describe('addMember', () => {
    let groupRoom: RoomEntity;

    beforeEach(() => {
      groupRoom = RoomEntity.createGroupRoom('creator-1', 'Team', [
        'user-2',
        'user-3',
      ]);
    });

    it('should add a new member when invoked by admin', () => {
      groupRoom.addMember('creator-1', 'user-4');
      expect(groupRoom.isMember('user-4')).toBe(true);
      expect(groupRoom.getMember('user-4')?.getRole()).toBe(MemberRole.MEMBER);
    });

    it('should reactivate a member if previously waiting', () => {
      const restored = RoomEntity.restore({
        id: 'room-1',
        title: 'Team',
        typeRoom: RoomType.GROUP,
        avatar: null,
        lastMessageId: null,
        members: [
          {
            userId: 'creator-1',
            role: MemberRole.SUPER_ADMIN,
            status: MemberStatus.ACCEPTED,
          },
          {
            userId: 'user-2',
            role: MemberRole.MEMBER,
            status: MemberStatus.ACCEPTED,
          },
          {
            userId: 'user-waiting',
            role: MemberRole.MEMBER,
            status: MemberStatus.WAITTING,
          },
        ],
      });

      restored.addMember('creator-1', 'user-waiting');
      expect(restored.isMember('user-waiting')).toBe(true);
    });

    it('should throw if room is not GROUP', () => {
      const single = RoomEntity.createSingleRoom('user-1', 'user-2');
      expect(() => single.addMember('user-1', 'user-3')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if adder is not admin', () => {
      expect(() => groupRoom.addMember('user-2', 'user-4')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if room reaches MAX_GROUP_MEMBERS', () => {
      const fullMembers = [
        {
          userId: 'creator-1',
          role: MemberRole.SUPER_ADMIN,
          status: MemberStatus.ACCEPTED,
        },
      ];
      for (let i = 2; i <= 100; i++) {
        fullMembers.push({
          userId: `user-${i}`,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        });
      }
      const fullRoom = RoomEntity.restore({
        id: 'room-full',
        title: 'Full Team',
        typeRoom: RoomType.GROUP,
        avatar: null,
        lastMessageId: null,
        members: fullMembers,
      });

      expect(() => fullRoom.addMember('creator-1', 'user-101')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if adder tries to add themselves', () => {
      expect(() => groupRoom.addMember('creator-1', 'creator-1')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if target user is already an accepted member', () => {
      expect(() => groupRoom.addMember('creator-1', 'user-2')).toThrow(
        DomainValidationException,
      );
    });
  });

  describe('removeMember', () => {
    let groupRoom: RoomEntity;

    beforeEach(() => {
      groupRoom = RoomEntity.createGroupRoom('creator-1', 'Team', [
        'user-2',
        'user-3',
      ]);
    });

    it('should remove a regular member when invoked by creator/admin', () => {
      groupRoom.removeMember('creator-1', 'user-2');
      expect(groupRoom.isMember('user-2')).toBe(false);
      expect(groupRoom.getMembers()).toHaveLength(2);
    });

    it('should throw if actor tries to remove themselves', () => {
      expect(() => groupRoom.removeMember('creator-1', 'creator-1')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if non-admin tries to remove member', () => {
      expect(() => groupRoom.removeMember('user-2', 'user-3')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if target user does not exist in room', () => {
      expect(() => groupRoom.removeMember('creator-1', 'user-999')).toThrow(
        DomainValidationException,
      );
    });

    it('should not allow admin to remove another admin or super admin', () => {
      groupRoom.assignAdmin('creator-1', 'user-2');
      groupRoom.assignAdmin('creator-1', 'user-3');

      // Admin user-2 tries to remove admin user-3
      expect(() => groupRoom.removeMember('user-2', 'user-3')).toThrow(
        DomainValidationException,
      );

      // Admin user-2 tries to remove super admin creator-1
      expect(() => groupRoom.removeMember('user-2', 'creator-1')).toThrow(
        DomainValidationException,
      );
    });
  });

  describe('leaveRoom', () => {
    it('should allow normal member to leave room without transferring super admin', () => {
      const room = RoomEntity.createGroupRoom('creator-1', 'Team', [
        'user-2',
        'user-3',
      ]);
      const result = room.leaveRoom('user-2');

      expect(room.isMember('user-2')).toBe(false);
      expect(result.newSuperAdminId).toBeUndefined();
      expect(result.isRoomEmpty).toBe(false);
    });

    it('should transfer super admin to an admin successor if super admin leaves', () => {
      const room = RoomEntity.createGroupRoom('creator-1', 'Team', [
        'user-2',
        'user-3',
      ]);
      room.assignAdmin('creator-1', 'user-3');

      const result = room.leaveRoom('creator-1');
      expect(result.newSuperAdminId).toBe('user-3');
      expect(room.getMember('user-3')?.getRole()).toBe(MemberRole.SUPER_ADMIN);
      expect(result.isRoomEmpty).toBe(false);
    });

    it('should transfer super admin to regular member if no admin exists', () => {
      const room = RoomEntity.createGroupRoom('creator-1', 'Team', [
        'user-2',
        'user-3',
      ]);
      const result = room.leaveRoom('creator-1');

      expect(result.newSuperAdminId).toBe('user-2');
      expect(room.getMember('user-2')?.getRole()).toBe(MemberRole.SUPER_ADMIN);
      expect(result.isRoomEmpty).toBe(false);
    });

    it('should return isRoomEmpty true if last member leaves', () => {
      const room = RoomEntity.restore({
        id: 'room-1',
        title: 'Solo',
        typeRoom: RoomType.GROUP,
        avatar: null,
        lastMessageId: null,
        members: [
          {
            userId: 'creator-1',
            role: MemberRole.SUPER_ADMIN,
            status: MemberStatus.ACCEPTED,
          },
        ],
      });

      const result = room.leaveRoom('creator-1');
      expect(result.isRoomEmpty).toBe(true);
      expect(result.newSuperAdminId).toBeUndefined();
    });

    it('should throw if room is not GROUP or user is not a member', () => {
      const single = RoomEntity.createSingleRoom('user-1', 'user-2');
      expect(() => single.leaveRoom('user-1')).toThrow(
        DomainValidationException,
      );

      const group = RoomEntity.createGroupRoom('creator-1', 'Team', [
        'user-2',
        'user-3',
      ]);
      expect(() => group.leaveRoom('stranger')).toThrow(
        DomainValidationException,
      );
    });
  });

  describe('assignAdmin and revokeAdmin', () => {
    let groupRoom: RoomEntity;

    beforeEach(() => {
      groupRoom = RoomEntity.createGroupRoom('creator-1', 'Team', [
        'user-2',
        'user-3',
      ]);
    });

    it('should allow super admin to assign and revoke admin', () => {
      groupRoom.assignAdmin('creator-1', 'user-2');
      expect(groupRoom.getMember('user-2')?.getRole()).toBe(MemberRole.ADMIN);

      groupRoom.revokeAdmin('creator-1', 'user-2');
      expect(groupRoom.getMember('user-2')?.getRole()).toBe(MemberRole.MEMBER);
    });

    it('should throw if non-super-admin tries to assign admin', () => {
      expect(() => groupRoom.assignAdmin('user-2', 'user-3')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if assigning admin to someone already admin', () => {
      groupRoom.assignAdmin('creator-1', 'user-2');
      expect(() => groupRoom.assignAdmin('creator-1', 'user-2')).toThrow(
        DomainValidationException,
      );
    });

    it('should throw if revoking admin from non-admin member or super admin', () => {
      expect(() => groupRoom.revokeAdmin('creator-1', 'user-2')).toThrow(
        DomainValidationException,
      );
      expect(() => groupRoom.revokeAdmin('creator-1', 'creator-1')).toThrow(
        DomainValidationException,
      );
    });
  });

  describe('restore and toObject', () => {
    it('should restore entity and export back to RoomProps with lastReadMessageId', () => {
      const props = {
        id: 'room-100',
        title: 'Group Props',
        typeRoom: RoomType.GROUP,
        avatar: 'https://avatar.png',
        lastMessageId: 'msg-50',
        members: [
          {
            userId: 'u1',
            role: MemberRole.SUPER_ADMIN,
            status: MemberStatus.ACCEPTED,
            lastReadMessageId: 'msg-40',
          },
          {
            userId: 'u2',
            role: MemberRole.MEMBER,
            status: MemberStatus.ACCEPTED,
          },
        ],
      };

      const entity = RoomEntity.restore(props);

      expect(entity.getId()).toBe('room-100');
      expect(entity.getTitle()).toBe('Group Props');
      expect(entity.getLastMessageId()).toBe('msg-50');

      const exported = entity.toObject();
      expect(exported.id).toBe('room-100');
      expect(exported.members[0].lastReadMessageId).toBe('msg-40');
      expect(exported.members[1].lastReadMessageId).toBeUndefined();
    });

    it('should restore version and export it in toObject', () => {
      const entity = RoomEntity.restore({
        id: 'room-1',
        title: 'Team',
        typeRoom: RoomType.GROUP,
        avatar: null,
        lastMessageId: null,
        version: 5,
        members: [],
      });
      expect(entity.getVersion()).toBe(5);
      expect(entity.toObject().version).toBe(5);
    });
  });
});
