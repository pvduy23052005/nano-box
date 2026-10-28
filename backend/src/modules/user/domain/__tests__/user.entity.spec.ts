import { UserEntity } from '../user.entity';
import { UserStatus } from '../user.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

const makeRestoredUser = (
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

describe('UserEntity', () => {
  describe('create', () => {
    it('nên tạo entity với status ACTIVE mặc định', () => {
      const user = UserEntity.create({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        password: 'hashed_password',
        avatar: 'http://example.com/avatar.png',
      });

      expect(user.getStatus()).toBe(UserStatus.ACTIVE);
    });

    it('không nên có id khi mới được tạo', () => {
      const user = UserEntity.create({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        password: 'hashed_password',
        avatar: 'http://example.com/avatar.png',
      });

      expect(user.getId()).toBeUndefined();
    });

    it('nên lưu đúng name, email và password', () => {
      const user = UserEntity.create({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        password: 'hashed_password',
        avatar: 'http://example.com/avatar.png',
      });

      expect(user.getName()).toBe('Nguyen Van A');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getPassword()).toBe('hashed_password');
    });

    it('nên ném lỗi DomainValidationException khi nhiều trường không hợp lệ cùng lúc', () => {
      let validationError: DomainValidationException | undefined;

      try {
        UserEntity.create({
          name: '   ',
          email: 'invalid-email',
          password: '123',
          avatar: 'http://example.com/avatar.png',
        });
      } catch (error) {
        validationError = error as DomainValidationException;
      }

      expect(validationError).toBeInstanceOf(DomainValidationException);
      expect(validationError?.errors).toEqual({
        name: 'Tên không được để trống',
        email: 'Email không đúng định dạng',
        password: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
    });

    it('nên tự động chuẩn hóa email bằng cách trim và chuyển thành chữ thường', () => {
      const user = UserEntity.create({
        name: 'Nguyen Van A',
        email: '   NguyenVanA@GMAIL.COM   ',
        password: 'hashed_password',
        avatar: 'http://example.com/avatar.png',
      });

      expect(user.getEmail()).toBe('nguyenvana@gmail.com');
    });

    it('nên ném lỗi khi email không đúng định dạng (chỉ có @ hoặc thiếu domain/tld)', () => {
      const invalidEmails = ['@', 'a@', 'invalid-email', 'user@domain', 'user@.com'];
      for (const email of invalidEmails) {
        expect(() =>
          UserEntity.create({
            name: 'Nguyen Van A',
            email,
            password: 'hashed_password',
            avatar: 'http://example.com/avatar.png',
          }),
        ).toThrow(DomainValidationException);
      }
    });

    it('nên ném lỗi khi tên dài hơn 100 ký tự', () => {
      const longName = 'A'.repeat(101);
      expect(() =>
        UserEntity.create({
          name: longName,
          email: 'test@example.com',
          password: 'hashed_password',
          avatar: 'http://example.com/avatar.png',
        }),
      ).toThrow(DomainValidationException);
    });

    it('nên ném lỗi khi avatar có scheme không an toàn như javascript: hoặc //', () => {
      expect(() =>
        UserEntity.create({
          name: 'Nguyen Van A',
          email: 'test@example.com',
          password: 'hashed_password',
          avatar: 'javascript:alert(1)',
        }),
      ).toThrow(DomainValidationException);

      expect(() =>
        UserEntity.create({
          name: 'Nguyen Van A',
          email: 'test@example.com',
          password: 'hashed_password',
          avatar: '//evil.com/avatar.png',
        }),
      ).toThrow(DomainValidationException);
    });

    it('nên ném lỗi khi avatar dài hơn 2048 ký tự', () => {
      const longAvatar = 'https://example.com/' + 'a'.repeat(2040);
      expect(() =>
        UserEntity.create({
          name: 'Nguyen Van A',
          email: 'test@example.com',
          password: 'hashed_password',
          avatar: longAvatar,
        }),
      ).toThrow(DomainValidationException);
    });

    it('nên chấp nhận avatar là đường dẫn tương đối nội bộ hoặc url https hợp lệ', () => {
      const userWithRelative = UserEntity.create({
        name: 'Nguyen Van A',
        email: 'test1@example.com',
        password: 'hashed_password',
        avatar: '/login.png',
      });
      expect(userWithRelative.getAvatar()).toBe('/login.png');

      const userWithHttps = UserEntity.create({
        name: 'Nguyen Van A',
        email: 'test2@example.com',
        password: 'hashed_password',
        avatar: 'https://example.com/avatar.png',
      });
      expect(userWithHttps.getAvatar()).toBe('https://example.com/avatar.png');
    });
  });

  describe('restore', () => {
    it('nên khôi phục đầy đủ các trường từ dữ liệu lưu trữ', () => {
      const user = makeRestoredUser();

      expect(user.getId()).toBe('user-id-1');
      expect(user.getName()).toBe('Nguyen Van A');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getPassword()).toBe('hashed_password');
      expect(user.getStatus()).toBe(UserStatus.ACTIVE);
    });

    it('nên khôi phục entity với status INACTIVE', () => {
      const user = makeRestoredUser({ status: UserStatus.INACTIVE });

      expect(user.getStatus()).toBe(UserStatus.INACTIVE);
    });

    it('nên tự động gán avatar mặc định khi khôi phục với avatar rỗng', () => {
      const user = makeRestoredUser({ avatar: '   ' });

      expect(user.getAvatar()).toBe('/login.png');
    });
  });

  describe('changePassword', () => {
    it('nên cập nhật mật khẩu khi mật khẩu mới hợp lệ', () => {
      const user = makeRestoredUser();

      user.changePassword('new_password_123');

      expect(user.getPassword()).toBe('new_password_123');
    });

    it('nên ném lỗi DomainValidationException khi mật khẩu mới ngắn hơn 6 ký tự', () => {
      const user = makeRestoredUser();

      expect(() => user.changePassword('12345')).toThrow(
        DomainValidationException,
      );

      try {
        user.changePassword('12345');
      } catch (error) {
        const validationError = error as DomainValidationException;
        expect(validationError.errors).toEqual({
          password: 'Mật khẩu phải có ít nhất 6 ký tự',
        });
      }
    });

    it('nên ném lỗi DomainValidationException khi mật khẩu mới là chuỗi rỗng', () => {
      const user = makeRestoredUser();

      expect(() => user.changePassword('')).toThrow(DomainValidationException);

      try {
        user.changePassword('');
      } catch (error) {
        const validationError = error as DomainValidationException;
        expect(validationError.errors).toEqual({
          password: 'Mật khẩu phải có ít nhất 6 ký tự',
        });
      }
    });
  });

  describe('activate / deactivate', () => {
    it('nên đặt status INACTIVE khi deactivate', () => {
      const user = makeRestoredUser({ status: UserStatus.ACTIVE });

      user.deactivate();

      expect(user.getStatus()).toBe(UserStatus.INACTIVE);
    });

    it('nên đặt status ACTIVE khi activate', () => {
      const user = makeRestoredUser({ status: UserStatus.INACTIVE });

      user.activate();

      expect(user.getStatus()).toBe(UserStatus.ACTIVE);
    });
  });

  describe('updateProfile', () => {
    it('nên cập nhật tên khi hợp lệ', () => {
      const user = makeRestoredUser();

      user.updateProfile('Tran Van B');

      expect(user.getName()).toBe('Tran Van B');
    });

    it('nên ném lỗi DomainValidationException khi tên là chuỗi rỗng', () => {
      const user = makeRestoredUser();

      expect(() => user.updateProfile('')).toThrow(DomainValidationException);

      try {
        user.updateProfile('');
      } catch (error) {
        const validationError = error as DomainValidationException;
        expect(validationError.errors).toEqual({
          name: 'Tên không được để trống',
        });
      }
    });

    it('nên ném lỗi DomainValidationException khi tên chỉ chứa khoảng trắng', () => {
      const user = makeRestoredUser();

      expect(() => user.updateProfile('   ')).toThrow(
        DomainValidationException,
      );

      try {
        user.updateProfile('   ');
      } catch (error) {
        const validationError = error as DomainValidationException;
        expect(validationError.errors).toEqual({
          name: 'Tên không được để trống',
        });
      }
    });

    it('nên cập nhật cả tên và avatar qua object props', () => {
      const user = makeRestoredUser();

      user.updateProfile({
        name: 'Tran Van C',
        avatar: 'http://example.com/new-avatar.png',
      });

      expect(user.getName()).toBe('Tran Van C');
      expect(user.getAvatar()).toBe('http://example.com/new-avatar.png');
    });

    it('nên cập nhật chỉ avatar khi không truyền name', () => {
      const user = makeRestoredUser();

      user.updateProfile({
        avatar: 'http://example.com/only-avatar.png',
      });

      expect(user.getName()).toBe('Nguyen Van A');
      expect(user.getAvatar()).toBe('http://example.com/only-avatar.png');
    });

    it('nên cập nhật chỉ name khi không truyền avatar', () => {
      const user = makeRestoredUser();

      user.updateProfile({
        name: 'Tran Van D',
      });

      expect(user.getName()).toBe('Tran Van D');
      expect(user.getAvatar()).toBe('http://example.com/avatar.png');
    });

    it('nên ném lỗi DomainValidationException khi name trong object là chuỗi rỗng', () => {
      const user = makeRestoredUser();

      expect(() => user.updateProfile({ name: '' })).toThrow(
        DomainValidationException,
      );

      try {
        user.updateProfile({ name: '' });
      } catch (error) {
        const validationError = error as DomainValidationException;
        expect(validationError.errors).toEqual({
          name: 'Tên không được để trống',
        });
      }
    });

    it('nên ném lỗi khi cập nhật tên dài hơn 100 ký tự', () => {
      const user = makeRestoredUser();
      const longName = 'B'.repeat(101);

      expect(() => user.updateProfile(longName)).toThrow(
        DomainValidationException,
      );
      expect(() => user.updateProfile({ name: longName })).toThrow(
        DomainValidationException,
      );
    });

    it('nên ném lỗi khi cập nhật avatar không hợp lệ hoặc không an toàn', () => {
      const user = makeRestoredUser();

      expect(() =>
        user.updateProfile({ avatar: 'javascript:alert(1)' }),
      ).toThrow(DomainValidationException);

      expect(() =>
        user.updateProfile({ avatar: 'data:image/svg+xml;base64,PHN2Zz4=' }),
      ).toThrow(DomainValidationException);

      expect(() =>
        user.updateProfile({ avatar: '//evil.com/avatar.png' }),
      ).toThrow(DomainValidationException);

      expect(() =>
        user.updateProfile({ avatar: '   ' }),
      ).toThrow(DomainValidationException);

      const longAvatar = 'https://example.com/' + 'a'.repeat(2040);
      expect(() => user.updateProfile({ avatar: longAvatar })).toThrow(
        DomainValidationException,
      );
    });
  });
});
