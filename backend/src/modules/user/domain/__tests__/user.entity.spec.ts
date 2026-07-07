import { UserEntity } from '../user.entity';
import { UserStatus } from '../user.type';

const makeRestoredUser = (
  overrides: Partial<Parameters<typeof UserEntity.restore>[0]> = {},
) =>
  UserEntity.restore({
    id: 'user-id-1',
    name: 'Nguyen Van A',
    email: 'test@example.com',
    password: 'hashed_password',
    status: UserStatus.ACTIVE,
    ...overrides,
  });

describe('UserEntity', () => {
  describe('create', () => {
    it('nên tạo entity với status ACTIVE mặc định', () => {
      const user = UserEntity.create({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        password: 'hashed_password',
      });

      expect(user.getStatus()).toBe(UserStatus.ACTIVE);
    });

    it('không nên có id khi mới được tạo', () => {
      const user = UserEntity.create({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        password: 'hashed_password',
      });

      expect(user.getId()).toBeUndefined();
    });

    it('nên lưu đúng name, email và password', () => {
      const user = UserEntity.create({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        password: 'hashed_password',
      });

      expect(user.getName()).toBe('Nguyen Van A');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getPassword()).toBe('hashed_password');
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
  });

  describe('changePassword', () => {
    it('nên cập nhật mật khẩu khi mật khẩu mới hợp lệ', () => {
      const user = makeRestoredUser();

      user.changePassword('new_password_123');

      expect(user.getPassword()).toBe('new_password_123');
    });

    it('nên ném lỗi khi mật khẩu mới ngắn hơn 6 ký tự', () => {
      const user = makeRestoredUser();

      expect(() => user.changePassword('12345')).toThrow(
        'Invalid password length.',
      );
    });

    it('nên ném lỗi khi mật khẩu mới là chuỗi rỗng', () => {
      const user = makeRestoredUser();

      expect(() => user.changePassword('')).toThrow('Invalid password length.');
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

    it('nên ném lỗi khi tên là chuỗi rỗng', () => {
      const user = makeRestoredUser();

      expect(() => user.updateProfile('')).toThrow('Name cannot be empty.');
    });

    it('nên ném lỗi khi tên chỉ chứa khoảng trắng', () => {
      const user = makeRestoredUser();

      expect(() => user.updateProfile('   ')).toThrow('Name cannot be empty.');
    });
  });
});
