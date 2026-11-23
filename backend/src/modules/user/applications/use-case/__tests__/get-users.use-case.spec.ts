import { GetUsersUseCase } from '../get-users.use-case';
import { UserRepositoryAdapter } from '../../ports/user.port';
import { UserEntity } from '../../../domain/user.entity';
import { UserStatus } from '../../../domain/user.type';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;
  let mockUserRepository: jest.Mocked<UserRepositoryAdapter>;

  const mockUsers = [
    UserEntity.restore({
      id: 'user-1',
      name: 'Nguyen Van A',
      email: 'a@example.com',
      password: '',
      status: UserStatus.ACTIVE,
      avatar: 'http://example.com/a.png',
    }),
    UserEntity.restore({
      id: 'user-2',
      name: 'Tran Van B',
      email: 'b@example.com',
      password: '',
      status: UserStatus.ACTIVE,
      avatar: 'http://example.com/b.png',
    }),
  ];

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue(mockUsers),
    };

    useCase = new GetUsersUseCase(mockUserRepository);
  });

  it('nên trả về danh sách user profile mà không chứa password', async () => {
    const result = await useCase.execute();

    expect(mockUserRepository.findAll).toHaveBeenCalledWith(
      undefined,
      undefined,
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'user-1',
      name: 'Nguyen Van A',
      email: 'a@example.com',
      avatar: 'http://example.com/a.png',
    });
    expect(result[0]).not.toHaveProperty('password');
  });

  it('nên truyền đúng search và limit xuống repository', async () => {
    await useCase.execute('Nguyen', 10);

    expect(mockUserRepository.findAll).toHaveBeenCalledWith('Nguyen', 10);
  });
});
