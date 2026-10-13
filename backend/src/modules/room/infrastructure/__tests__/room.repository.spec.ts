import { Model, Types } from 'mongoose';
import { RoomRepository } from '../room.repository';
import { MemberRole, MemberStatus } from '../../domain/chat.enum';
import { RoomDocument } from '../room.schema';
import { UserDocument } from '../../../user/infrastructure/databases/user.schema';

describe('RoomRepository - Lightweight methods', () => {
  let roomRepository: RoomRepository;
  let mockRoomModel: Record<string, jest.Mock>;
  let mockUserModel: Record<string, jest.Mock>;

  beforeEach(() => {
    mockRoomModel = {
      findById: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };
    mockUserModel = {};

    roomRepository = new RoomRepository(
      mockRoomModel as unknown as Model<RoomDocument>,
      mockUserModel as unknown as Model<UserDocument>,
    );
  });

  describe('findRoomMembers', () => {
    const validRoomId = new Types.ObjectId().toString();

    it('should return null if roomId is invalid', async () => {
      const result = await roomRepository.findRoomMembers('invalid-id');
      expect(result).toBeNull();
      expect(mockRoomModel.findById).not.toHaveBeenCalled();
    });

    it('should query without populate', async () => {
      const mockExec = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(validRoomId),
        members: [
          {
            user_id: new Types.ObjectId('111111111111111111111111'),
            role: MemberRole.ADMIN,
            status: MemberStatus.ACCEPTED,
          },
          {
            user_id: new Types.ObjectId('222222222222222222222222'),
            role: MemberRole.MEMBER,
            status: MemberStatus.ACCEPTED,
          },
        ],
      });
      const mockLean = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
      mockRoomModel.findById.mockReturnValue({ select: mockSelect });

      const result = await roomRepository.findRoomMembers(validRoomId);

      expect(mockRoomModel.findById).toHaveBeenCalledWith(validRoomId);
      expect(mockSelect).toHaveBeenCalledWith(
        'members.user_id members.role members.status',
      );
      expect(result).toEqual({
        roomId: validRoomId,
        members: [
          {
            userId: '111111111111111111111111',
            role: MemberRole.ADMIN,
            status: MemberStatus.ACCEPTED,
            name: null,
            avatar: null,
          },
          {
            userId: '222222222222222222222222',
            role: MemberRole.MEMBER,
            status: MemberStatus.ACCEPTED,
            name: null,
            avatar: null,
          },
        ],
      });
    });

    it('should return null if room not found in DB', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockLean = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
      mockRoomModel.findById.mockReturnValue({ select: mockSelect });

      const result = await roomRepository.findRoomMembers(validRoomId);
      expect(result).toBeNull();
    });
  });

  describe('findRoomMembersWithProfile', () => {
    const validRoomId = new Types.ObjectId().toString();

    it('should return null if roomId is invalid', async () => {
      const result =
        await roomRepository.findRoomMembersWithProfile('invalid-id');
      expect(result).toBeNull();
      expect(mockRoomModel.findById).not.toHaveBeenCalled();
    });

    it('should query with user_id populate', async () => {
      const mockExec = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(validRoomId),
        members: [
          {
            user_id: {
              _id: new Types.ObjectId('111111111111111111111111'),
              name: 'Alice',
              avatar: 'alice.png',
            },
            role: MemberRole.ADMIN,
            status: MemberStatus.ACCEPTED,
          },
        ],
      });
      const mockLean = jest.fn().mockReturnValue({ exec: mockExec });
      const mockPopulate = jest.fn().mockReturnValue({ lean: mockLean });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      mockRoomModel.findById.mockReturnValue({ select: mockSelect });

      const result =
        await roomRepository.findRoomMembersWithProfile(validRoomId);

      expect(mockRoomModel.findById).toHaveBeenCalledWith(validRoomId);
      expect(mockSelect).toHaveBeenCalledWith('members');
      expect(mockPopulate).toHaveBeenCalledWith({
        path: 'members.user_id',
        select: 'name avatar',
      });
      expect(result).toEqual({
        roomId: validRoomId,
        members: [
          {
            userId: '111111111111111111111111',
            role: MemberRole.ADMIN,
            status: MemberStatus.ACCEPTED,
            name: 'Alice',
            avatar: 'alice.png',
          },
        ],
      });
    });

    it('should return null if room not found in DB', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockLean = jest.fn().mockReturnValue({ exec: mockExec });
      const mockPopulate = jest.fn().mockReturnValue({ lean: mockLean });
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      mockRoomModel.findById.mockReturnValue({ select: mockSelect });

      const result =
        await roomRepository.findRoomMembersWithProfile(validRoomId);
      expect(result).toBeNull();
    });
  });

  describe('findRelatedUserIdsByRooms', () => {
    const validUserId = new Types.ObjectId().toString();

    it('should return empty array if userId is invalid', async () => {
      const result = await roomRepository.findRelatedUserIdsByRooms(
        'invalid-user-id',
        MemberStatus.ACCEPTED,
      );
      expect(result).toEqual([]);
      expect(mockRoomModel.find).not.toHaveBeenCalled();
    });

    it('should query rooms with minimal fields and return unique related user IDs', async () => {
      const mockExec = jest.fn().mockResolvedValue([
        {
          _id: new Types.ObjectId(),
          members: [
            {
              user_id: new Types.ObjectId(validUserId),
              status: MemberStatus.ACCEPTED,
            },
            {
              user_id: new Types.ObjectId('333333333333333333333333'),
              status: MemberStatus.ACCEPTED,
            },
            {
              user_id: new Types.ObjectId('444444444444444444444444'),
              status: MemberStatus.WAITTING,
            },
          ],
        },
        {
          _id: new Types.ObjectId(),
          members: [
            {
              user_id: new Types.ObjectId(validUserId),
              status: MemberStatus.ACCEPTED,
            },
            {
              user_id: new Types.ObjectId('333333333333333333333333'),
              status: MemberStatus.ACCEPTED,
            },
            {
              user_id: new Types.ObjectId('555555555555555555555555'),
              status: MemberStatus.ACCEPTED,
            },
          ],
        },
      ]);
      const mockLean = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
      mockRoomModel.find.mockReturnValue({ select: mockSelect });

      const result = await roomRepository.findRelatedUserIdsByRooms(
        validUserId,
        MemberStatus.ACCEPTED,
      );

      expect(mockRoomModel.find).toHaveBeenCalledWith({
        members: {
          $elemMatch: {
            user_id: new Types.ObjectId(validUserId),
            status: MemberStatus.ACCEPTED,
          },
        },
      });
      expect(mockSelect).toHaveBeenCalledWith('members.user_id members.status');
      expect(result).toEqual([
        '333333333333333333333333',
        '555555555555555555555555',
      ]);
    });
  });
});
