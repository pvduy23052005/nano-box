import { RegisterUseCase } from '../register.use-case';
import { UserRepositoryAdapter } from '../../ports/user.port';
import { IpasswordHasher } from '../../ports/password-hasher.port';
import { UserEntity } from '../../../domain/user.entity';
import { UserStatus } from '../../../domain/user.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

const makeMockUserRepository = (): jest.Mocked<UserRepositoryAdapter> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(), findAll: jest.fn(),
});

const makeMockPasswordHasher = (): jest.Mocked<IpasswordHasher> => ({
  hash: jest.fn(),
  compare: jest.fn(),
});

const makePersistedUser = () =>
  UserEntity.restore({
    id: 'user-id-1',
    name: 'Nguyen Van A',
    email: 'test@example.com',
    password: 'hashed_password',
    status: UserStatus.ACTIVE, avatar: 'http://example.com/avatar.png',
  });

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let userRepository: jest.Mocked<UserRepositoryAdapter>;
  let passwordHasher: jest.Mocked<IpasswordHasher>;

  const validInput = {
    name: 'Nguyen Van A',
    email: 'test@example.com',
    password: '123456',
    confirmPassword: '123456',
  };

  beforeEach(() => {
    userRepository = makeMockUserRepository();
    passwordHasher = makeMockPasswordHasher();
    registerUseCase = new RegisterUseCase(userRepository, passwordHasher);
  });

  describe('execute', () => {
    describe('khi đăng ký thành công', () => {
      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(null);
        passwordHasher.hash.mockResolvedValue('hashed_password');
        userRepository.save.mockResolvedValue(makePersistedUser());
      });

      it('nên hash mật khẩu và lưu đúng entity với status ACTIVE', async () => {
        const result = await registerUseCase.execute(validInput);

        expect(result.getEmail()).toBe(validInput.email);
        expect(result.getName()).toBe(validInput.name);

        expect(userRepository.findByEmail).toHaveBeenCalledWith(
          validInput.email,
        );
        expect(passwordHasher.hash).toHaveBeenCalledWith(validInput.password);
        expect(userRepository.save).toHaveBeenCalledTimes(1);

        const savedEntity: UserEntity = userRepository.save.mock.calls[0][0];
        expect(savedEntity.getPassword()).toBe('hashed_password');
        expect(savedEntity.getStatus()).toBe(UserStatus.ACTIVE);
      });
    });

    describe('khi email đã tồn tại', () => {
      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(makePersistedUser());
      });

      it('nên ném lỗi DomainValidationException và không thực hiện hash hay lưu dữ liệu', async () => {
        const promise = registerUseCase.execute(validInput);
        await expect(promise).rejects.toThrow(DomainValidationException);

        try {
          await promise;
        } catch (error) {
          const domainError = error as DomainValidationException;
          expect(domainError.errors).toEqual({
            email: 'Email đã tồn tại',
          });
        }

        expect(passwordHasher.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('khi có nhiều lỗi validation cùng lúc (email tồn tại và xác nhận mật khẩu không khớp)', () => {
      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(makePersistedUser());
      });

      it('nên ném lỗi DomainValidationException chứa tất cả các lỗi', async () => {
        const invalidInput = {
          ...validInput,
          confirmPassword: 'mismatched_password',
        };

        const promise = registerUseCase.execute(invalidInput);
        await expect(promise).rejects.toThrow(DomainValidationException);

        try {
          await promise;
        } catch (error) {
          const domainError = error as DomainValidationException;
          expect(domainError.errors).toEqual({
            email: 'Email đã tồn tại',
            password: 'Xác nhận mật khẩu không chính xác',
          });
        }

        expect(passwordHasher.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('khi repository gặp lỗi', () => {
      it('nên truyền lỗi lên khi findByEmail thất bại', async () => {
        userRepository.findByEmail.mockRejectedValue(
          new Error('Kết nối cơ sở dữ liệu thất bại'),
        );

        await expect(registerUseCase.execute(validInput)).rejects.toThrow(
          'Kết nối cơ sở dữ liệu thất bại',
        );
      });

      it('nên truyền lỗi lên khi save thất bại', async () => {
        userRepository.findByEmail.mockResolvedValue(null);
        passwordHasher.hash.mockResolvedValue('hashed_password');
        userRepository.save.mockRejectedValue(
          new Error('Ghi dữ liệu cơ sở dữ liệu thất bại'),
        );

        await expect(registerUseCase.execute(validInput)).rejects.toThrow(
          'Ghi dữ liệu cơ sở dữ liệu thất bại',
        );
      });
    });
  });
});
