import { LoginUseCase } from '../login.use-case';
import { ITokenGenerator } from '../../ports/token-generator.port';
import { IpasswordHasher } from 'src/modules/user/applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { UserEntity } from 'src/modules/user/domain/user.entity';
import { UserStatus } from 'src/modules/user/domain/user.type';

const makeMockUserRepository = (): jest.Mocked<UserRepositoryAdapter> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
});

const makeMockPasswordHasher = (): jest.Mocked<IpasswordHasher> => ({
  hash: jest.fn(),
  compare: jest.fn(),
});

const makeMockTokenGenerator = (): jest.Mocked<ITokenGenerator> => ({
  generateToken: jest.fn(),
});

const makePersistedUser = () =>
  UserEntity.restore({
    id: 'user-id-1',
    name: 'Nguyen Van A',
    email: 'test@example.com',
    password: 'hashed_password',
    status: UserStatus.ACTIVE,
  });

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepositoryAdapter>;
  let passwordHasher: jest.Mocked<IpasswordHasher>;
  let tokenGenerator: jest.Mocked<ITokenGenerator>;

  const validInput = {
    email: 'test@example.com',
    password: '123456',
  };

  beforeEach(() => {
    userRepository = makeMockUserRepository();
    passwordHasher = makeMockPasswordHasher();
    tokenGenerator = makeMockTokenGenerator();
    loginUseCase = new LoginUseCase(
      userRepository,
      passwordHasher,
      tokenGenerator,
    );
  });

  describe('execute', () => {
    describe('khi đăng nhập thành công', () => {
      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(makePersistedUser());
        passwordHasher.compare.mockResolvedValue(true);
        tokenGenerator.generateToken.mockReturnValue('signed.jwt.token');
      });

      it('nên trả về access token và thông tin người dùng', async () => {
        const result = await loginUseCase.execute(validInput);

        expect(result.accessToken).toBe('signed.jwt.token');
        expect(result.user.id).toBe('user-id-1');
        expect(result.user.email).toBe('test@example.com');
      });

      it('nên gọi findByEmail đúng với email đã cung cấp', async () => {
        await loginUseCase.execute(validInput);

        expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(userRepository.findByEmail).toHaveBeenCalledWith(
          validInput.email,
        );
      });

      it('nên so sánh mật khẩu thô với mật khẩu đã hash trong DB', async () => {
        await loginUseCase.execute(validInput);

        expect(passwordHasher.compare).toHaveBeenCalledTimes(1);
        expect(passwordHasher.compare).toHaveBeenCalledWith(
          validInput.password,
          'hashed_password',
        );
      });

      it('nên tạo token với đúng payload của người dùng', async () => {
        await loginUseCase.execute(validInput);

        expect(tokenGenerator.generateToken).toHaveBeenCalledTimes(1);
        expect(tokenGenerator.generateToken).toHaveBeenCalledWith({
          id: 'user-id-1',
          email: 'test@example.com',
        });
      });
    });

    describe('khi email không tồn tại', () => {
      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(null);
        passwordHasher.compare.mockResolvedValue(false);
      });

      it('nên ném lỗi với thông báo chung chung', async () => {
        await expect(loginUseCase.execute(validInput)).rejects.toThrow(
          'Email hoặc mật khẩu không đúng',
        );
      });

      it('không nên tạo token', async () => {
        await expect(loginUseCase.execute(validInput)).rejects.toThrow();

        expect(tokenGenerator.generateToken).not.toHaveBeenCalled();
      });
    });

    describe('khi mật khẩu không đúng', () => {
      beforeEach(() => {
        userRepository.findByEmail.mockResolvedValue(makePersistedUser());
        passwordHasher.compare.mockResolvedValue(false);
      });

      it('nên ném lỗi với thông báo chung chung', async () => {
        await expect(loginUseCase.execute(validInput)).rejects.toThrow(
          'Email hoặc mật khẩu không đúng',
        );
      });

      it('không nên tạo token', async () => {
        await expect(loginUseCase.execute(validInput)).rejects.toThrow();

        expect(tokenGenerator.generateToken).not.toHaveBeenCalled();
      });
    });

    describe('khi repository gặp lỗi', () => {
      it('nên truyền lỗi lên khi findByEmail thất bại', async () => {
        userRepository.findByEmail.mockRejectedValue(
          new Error('DB connection failed'),
        );

        await expect(loginUseCase.execute(validInput)).rejects.toThrow(
          'DB connection failed',
        );
      });

      it('nên truyền lỗi lên khi passwordHasher thất bại', async () => {
        userRepository.findByEmail.mockResolvedValue(makePersistedUser());
        passwordHasher.compare.mockRejectedValue(new Error('Hasher error'));

        await expect(loginUseCase.execute(validInput)).rejects.toThrow(
          'Hasher error',
        );
      });
    });
  });
});
