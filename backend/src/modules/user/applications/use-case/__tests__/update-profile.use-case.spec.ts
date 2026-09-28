import { UpdateProfileUseCase } from '../update-profile.use-case';
import { UserRepositoryAdapter } from '../../ports/user.port';
import { UserEntity } from '../../../domain/user.entity';
import { UserStatus } from '../../../domain/user.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

const makeMockUserRepository = (): jest.Mocked<UserRepositoryAdapter> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
});

const makePersistedUser = (
  overrides: Partial<Parameters<typeof UserEntity.restore>[0]> = {},
) =>
  UserEntity.restore({
    id: 'user-id-1',
    name: 'Nguyen Van A',
    email: 'test@example.com',
    password: 'hashed_password',
    status: UserStatus.ACTIVE,
    avatar: 'http://example.com/avatar.png',
    ...overrides,
  });

describe('UpdateProfileUseCase', () => {
  let updateProfileUseCase: UpdateProfileUseCase;
  let userRepository: jest.Mocked<UserRepositoryAdapter>;

  beforeEach(() => {
    userRepository = makeMockUserRepository();
    updateProfileUseCase = new UpdateProfileUseCase(userRepository);
  });

  describe('execute', () => {
    describe('khi cập nhật thành công', () => {
      it('nên cập nhật cả tên và avatar rồi lưu vào cơ sở dữ liệu', async () => {
        const existingUser = makePersistedUser();
        userRepository.findById.mockResolvedValue(existingUser);
        userRepository.save.mockImplementation((entity) => Promise.resolve(entity));

        const input = {
          name: 'Nguyen Van B',
          avatar: 'http://example.com/new-avatar.png',
        };

        const result = await updateProfileUseCase.execute('user-id-1', input);

        expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
        expect(userRepository.save).toHaveBeenCalledTimes(1);

        const savedEntity: UserEntity = userRepository.save.mock.calls[0][0];
        expect(savedEntity.getName()).toBe('Nguyen Van B');
        expect(savedEntity.getAvatar()).toBe('http://example.com/new-avatar.png');

        expect(result).toEqual({
          id: 'user-id-1',
          name: 'Nguyen Van B',
          email: 'test@example.com',
          avatar: 'http://example.com/new-avatar.png',
        });
      });

      it('nên chỉ cập nhật tên khi không truyền avatar', async () => {
        const existingUser = makePersistedUser();
        userRepository.findById.mockResolvedValue(existingUser);
        userRepository.save.mockImplementation((entity) => Promise.resolve(entity));

        const input = {
          name: 'Nguyen Van B',
        };

        const result = await updateProfileUseCase.execute('user-id-1', input);

        expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
        expect(userRepository.save).toHaveBeenCalledTimes(1);

        const savedEntity: UserEntity = userRepository.save.mock.calls[0][0];
        expect(savedEntity.getName()).toBe('Nguyen Van B');
        expect(savedEntity.getAvatar()).toBe('http://example.com/avatar.png');

        expect(result.name).toBe('Nguyen Van B');
        expect(result.avatar).toBe('http://example.com/avatar.png');
      });

      it('nên chỉ cập nhật avatar khi không truyền tên', async () => {
        const existingUser = makePersistedUser();
        userRepository.findById.mockResolvedValue(existingUser);
        userRepository.save.mockImplementation((entity) => Promise.resolve(entity));

        const input = {
          avatar: 'http://example.com/only-avatar.png',
        };

        const result = await updateProfileUseCase.execute('user-id-1', input);

        expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
        expect(userRepository.save).toHaveBeenCalledTimes(1);

        const savedEntity: UserEntity = userRepository.save.mock.calls[0][0];
        expect(savedEntity.getName()).toBe('Nguyen Van A');
        expect(savedEntity.getAvatar()).toBe('http://example.com/only-avatar.png');

        expect(result.name).toBe('Nguyen Van A');
        expect(result.avatar).toBe('http://example.com/only-avatar.png');
      });
    });

    describe('khi người dùng không tồn tại', () => {
      it('nên ném lỗi DomainValidationException và không gọi save', async () => {
        userRepository.findById.mockResolvedValue(null);

        const promise = updateProfileUseCase.execute('non-existent-id', {
          name: 'New Name',
        });

        await expect(promise).rejects.toThrow(DomainValidationException);

        try {
          await promise;
        } catch (error) {
          const domainError = error as DomainValidationException;
          expect(domainError.errors).toEqual({
            user: 'Người dùng không tồn tại',
          });
        }

        expect(userRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('khi tên không hợp lệ', () => {
      it('nên ném lỗi DomainValidationException và không gọi save khi tên rỗng', async () => {
        const existingUser = makePersistedUser();
        userRepository.findById.mockResolvedValue(existingUser);

        const promise = updateProfileUseCase.execute('user-id-1', {
          name: '   ',
        });

        await expect(promise).rejects.toThrow(DomainValidationException);

        try {
          await promise;
        } catch (error) {
          const domainError = error as DomainValidationException;
          expect(domainError.errors).toEqual({
            name: 'Tên không được để trống',
          });
        }

        expect(userRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('khi repository gặp lỗi', () => {
      it('nên truyền lỗi lên khi findById thất bại', async () => {
        userRepository.findById.mockRejectedValue(
          new Error('Kết nối cơ sở dữ liệu thất bại'),
        );

        await expect(
          updateProfileUseCase.execute('user-id-1', { name: 'Name' }),
        ).rejects.toThrow('Kết nối cơ sở dữ liệu thất bại');

        expect(userRepository.save).not.toHaveBeenCalled();
      });

      it('nên truyền lỗi lên khi save thất bại', async () => {
        const existingUser = makePersistedUser();
        userRepository.findById.mockResolvedValue(existingUser);
        userRepository.save.mockRejectedValue(
          new Error('Ghi dữ liệu cơ sở dữ liệu thất bại'),
        );

        await expect(
          updateProfileUseCase.execute('user-id-1', { name: 'Name' }),
        ).rejects.toThrow('Ghi dữ liệu cơ sở dữ liệu thất bại');
      });
    });
  });
});
