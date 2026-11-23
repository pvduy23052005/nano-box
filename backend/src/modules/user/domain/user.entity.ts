import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { UpdateProfileProps, UserProps, UserStatus } from './user.type';

export class UserEntity {
  private id?: string;
  private name: string;
  private email: string;
  private password?: string;
  private status: UserStatus;
  private avatar: string;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.status = props.status ?? UserStatus.ACTIVE;
    this.avatar = props.avatar?.trim() || '/login.png';
  }

  private static validateName(
    name?: string,
    errors: Record<string, string> = {},
  ): string | undefined {
    const cleanName = name?.trim();
    if (!cleanName) {
      errors.name = 'Tên không được để trống';
    } else if (cleanName.length > 100) {
      errors.name = 'Tên không được vượt quá 100 ký tự';
    }
    return cleanName;
  }

  private static validateAvatar(
    avatar?: string,
    errors: Record<string, string> = {},
    options: { isCreate?: boolean } = {},
  ): string {
    const cleanAvatar = avatar?.trim() ?? '';
    if (!cleanAvatar) {
      if (options.isCreate) {
        return '/login.png';
      }
      errors.avatar = 'Đường dẫn ảnh đại diện không hợp lệ';
      return '';
    }

    if (cleanAvatar.length > 2048) {
      errors.avatar = 'Đường dẫn ảnh đại diện không được vượt quá 2048 ký tự';
    } else if (
      !cleanAvatar.startsWith('http://') &&
      !cleanAvatar.startsWith('https://') &&
      (cleanAvatar.startsWith('//') || !cleanAvatar.startsWith('/'))
    ) {
      errors.avatar = 'Đường dẫn ảnh đại diện không hợp lệ';
    }

    return cleanAvatar;
  }

  public static create(props: Omit<UserProps, 'id' | 'status'>): UserEntity {
    const errors: Record<string, string> = {};

    const cleanName = this.validateName(props.name, errors);

    const cleanEmail = props.email?.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      errors.email = 'Email không đúng định dạng';
    }

    if (!props.password || props.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    const cleanAvatar = this.validateAvatar(props.avatar, errors, {
      isCreate: true,
    });

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    return new UserEntity({
      ...props,
      name: cleanName!,
      email: cleanEmail,
      avatar: cleanAvatar,
      status: UserStatus.ACTIVE,
    });
  }

  public static restore(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  public changePassword(newPassword: string): void {
    if (!newPassword || newPassword.length < 6) {
      throw new DomainValidationException(
        'password',
        'Mật khẩu phải có ít nhất 6 ký tự',
      );
    }
    this.password = newPassword;
  }

  public deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }

  public activate(): void {
    this.status = UserStatus.ACTIVE;
  }

  public updateProfile(
    nameOrProps: string | UpdateProfileProps,
    avatar?: string,
  ): void {
    let name: string | undefined;
    let newAvatar: string | undefined;

    if (typeof nameOrProps === 'string') {
      name = nameOrProps;
      newAvatar = avatar;
    } else {
      name = nameOrProps.name;
      newAvatar = nameOrProps.avatar;
    }

    const errors: Record<string, string> = {};
    let cleanName: string | undefined;
    let cleanAvatar: string | undefined;

    if (name !== undefined) {
      cleanName = UserEntity.validateName(name, errors);
    }

    if (newAvatar !== undefined) {
      cleanAvatar = UserEntity.validateAvatar(newAvatar, errors, {
        isCreate: false,
      });
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    if (cleanName !== undefined) {
      this.name = cleanName;
    }
    if (cleanAvatar !== undefined) {
      this.avatar = cleanAvatar;
    }
  }

  public getId(): string | undefined {
    return this.id;
  }
  public getName(): string {
    return this.name;
  }
  public getEmail(): string {
    return this.email;
  }
  public getPassword(): string {
    return this.password ?? '';
  }
  public getStatus(): UserStatus {
    return this.status;
  }

  public getAvatar(): string {
    return this.avatar;
  }
}
