import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { IPasswordHasher } from 'src/modules/user/applications/ports/password-hasher.port';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { UserEntity } from 'src/modules/user/domain/user.entity';
import { UserStatus } from 'src/modules/user/domain/user.type';
import { IGoogleAuthVerifier } from '../../ports/google-auth-verifier.port';
import { ITokenGenerator } from '../../ports/token-generator.port';
import { LoginGoogleUseCase } from '../login-google.use-case';

const makeMockUserRepository = (): jest.Mocked<UserRepositoryAdapter> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
});

const makeMockPasswordHasher = (): jest.Mocked<IPasswordHasher> => ({
  hash: jest.fn(),
  compare: jest.fn(),
});

const makeMockTokenGenerator = (): jest.Mocked<ITokenGenerator> => ({
  generateToken: jest.fn(),
});

const makeMockGoogleAuthVerifier = (): jest.Mocked<IGoogleAuthVerifier> => ({
  verify: jest.fn(),
});

const makePersistedUser = (status: UserStatus = UserStatus.ACTIVE) =>
  UserEntity.restore({
    id: 'user-google-1',
    name: 'Google User',
    email: 'google@example.com',
    password: 'hashed_password',
    status,
    avatar: 'https://example.com/avatar.jpg',
  });

describe('LoginGoogleUseCase', () => {
  let loginGoogleUseCase: LoginGoogleUseCase;
  let userRepository: jest.Mocked<UserRepositoryAdapter>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let tokenGenerator: jest.Mocked<ITokenGenerator>;
  let googleAuthVerifier: jest.Mocked<IGoogleAuthVerifier>;

  const idToken = 'valid.google.idtoken';

  beforeEach(() => {
    userRepository = makeMockUserRepository();
    passwordHasher = makeMockPasswordHasher();
    tokenGenerator = makeMockTokenGenerator();
    googleAuthVerifier = makeMockGoogleAuthVerifier();

    loginGoogleUseCase = new LoginGoogleUseCase(
      userRepository,
      passwordHasher,
      tokenGenerator,
      googleAuthVerifier,
    );
  });

  describe('khi idToken không hợp lệ hoặc không có email', () => {
    it('nên ném DomainValidationException khi verify trả về null', async () => {
      googleAuthVerifier.verify.mockResolvedValue(null);

      await expect(loginGoogleUseCase.execute(idToken)).rejects.toThrow(
        DomainValidationException,
      );
      expect(tokenGenerator.generateToken).not.toHaveBeenCalled();
    });

    it('nên ném DomainValidationException khi verify trả về email rỗng', async () => {
      googleAuthVerifier.verify.mockResolvedValue({
        email: '',
        name: 'No Email User',
      });

      await expect(loginGoogleUseCase.execute(idToken)).rejects.toThrow(
        DomainValidationException,
      );
      expect(tokenGenerator.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('khi người dùng đã tồn tại trong hệ thống', () => {
    beforeEach(() => {
      googleAuthVerifier.verify.mockResolvedValue({
        email: 'google@example.com',
        name: 'Google User',
        picture: 'https://example.com/avatar.jpg',
      });
      tokenGenerator.generateToken.mockReturnValue('jwt.token.google');
    });

    it('nên đăng nhập thành công và trả về accessToken nếu tài khoản ACTIVE', async () => {
      userRepository.findByEmail.mockResolvedValue(makePersistedUser());

      const result = await loginGoogleUseCase.execute(idToken);

      expect(result.accessToken).toBe('jwt.token.google');
      expect(result.user.id).toBe('user-google-1');
      expect(result.user.email).toBe('google@example.com');
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('nên ném lỗi từ chối khi tài khoản đã bị khóa (INACTIVE)', async () => {
      userRepository.findByEmail.mockResolvedValue(
        makePersistedUser(UserStatus.INACTIVE),
      );

      const promise = loginGoogleUseCase.execute(idToken);
      await expect(promise).rejects.toThrow(DomainValidationException);

      try {
        await promise;
      } catch (error) {
        const domainError = error as DomainValidationException;
        expect(domainError.errors).toEqual({
          token: 'Tài khoản của bạn đã bị khóa hoặc ngừng kích hoạt',
        });
      }

      expect(tokenGenerator.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('khi người dùng chưa tồn tại trong hệ thống', () => {
    beforeEach(() => {
      googleAuthVerifier.verify.mockResolvedValue({
        email: 'NEW_USER@Example.Com',
        name: 'New Google User',
        picture: 'https://example.com/new.jpg',
      });
      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue('random_hashed_password');
      userRepository.save.mockImplementation((entity) => {
        return Promise.resolve(
          UserEntity.restore({
            id: 'new-user-id',
            name: entity.getName(),
            email: entity.getEmail(),
            password: entity.getPassword(),
            status: entity.getStatus(),
            avatar: entity.getAvatar(),
          }),
        );
      });
      tokenGenerator.generateToken.mockReturnValue('new.jwt.token');
    });

    it('nên tự động tạo tài khoản mới với email chuẩn hóa chữ thường và mật khẩu ngẫu nhiên', async () => {
      const result = await loginGoogleUseCase.execute(idToken);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'new_user@example.com',
      );
      expect(passwordHasher.hash).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledTimes(1);

      expect(result.accessToken).toBe('new.jwt.token');
      expect(result.user.id).toBe('new-user-id');
      expect(result.user.email).toBe('new_user@example.com');
    });
  });
});
