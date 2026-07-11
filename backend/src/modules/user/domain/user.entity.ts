import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { UserProps, UserStatus } from './user.type';

export class UserEntity {
  private id?: string;
  private name: string;
  private email: string;
  private password: string;
  private status: UserStatus;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.status = props.status ?? UserStatus.ACTIVE;
  }

  public static create(props: Omit<UserProps, 'id' | 'status'>): UserEntity {
    const errors: Record<string, string> = {};

    if (!props.name || !props.name.trim()) {
      errors.name = 'Tên không được để trống';
    }

    if (!props.email || !props.email.includes('@')) {
      errors.email = 'Email không đúng định dạng';
    }

    if (!props.password || props.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    return new UserEntity({
      ...props,
      status: UserStatus.ACTIVE,
    });
  }

  public static restore(props: Required<UserProps>): UserEntity {
    return new UserEntity(props);
  }

  public changePassword(newPassword: string): void {
    if (newPassword.length < 6) {
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

  public updateProfile(name: string): void {
    if (!name.trim()) {
      throw new DomainValidationException('name', 'Tên không được để trống');
    }
    this.name = name;
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
    return this.password;
  }
  public getStatus(): UserStatus {
    return this.status;
  }
}
