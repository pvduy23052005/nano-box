import { ReceivedFriendRequestProps } from '../../../domain/friendship.type';
import { FriendshipRepositoryAdapter } from '../../ports/friendship.port';
import { GetReceivedFriendRequestsUseCase } from '../get-received-friend-requests.use-case';

describe('GetReceivedFriendRequestsUseCase', () => {
  let useCase: GetReceivedFriendRequestsUseCase;
  let mockFriendshipRepo: jest.Mocked<FriendshipRepositoryAdapter>;

  const userId = 'current-user-id';

  beforeEach(() => {
    mockFriendshipRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBetweenUsers: jest.fn(),
      findPendingReceived: jest.fn(),
    };

    useCase = new GetReceivedFriendRequestsUseCase(mockFriendshipRepo);
  });

  it('nên trả về danh sách lời mời kết bạn nhận được kèm thông tin người gửi', async () => {
    const mockList: ReceivedFriendRequestProps[] = [
      {
        id: 'friendship-1',
        sender: {
          id: 'sender-1',
          name: 'Nguyen Van A',
          email: 'a@example.com',
          avatar: 'avatar1.png',
        },
        createdAt: new Date(),
      },
      {
        id: 'friendship-2',
        sender: {
          id: 'sender-2',
          name: 'Tran Thi B',
          email: 'b@example.com',
          avatar: '',
        },
        createdAt: new Date(),
      },
    ];

    mockFriendshipRepo.findPendingReceived.mockResolvedValue(mockList);

    const result = await useCase.execute(userId);

    expect(mockFriendshipRepo.findPendingReceived).toHaveBeenCalledWith(userId);
    expect(result).toHaveLength(2);
    expect(result[0].sender.name).toBe('Nguyen Van A');
    expect(result[1].sender.name).toBe('Tran Thi B');
  });

});
