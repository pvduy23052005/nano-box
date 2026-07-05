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
    return new UserEntity({
      ...props,
      status: UserStatus.ACTIVE,
    });
  }

  public static restore(props: Required<UserProps>): UserEntity {
    return new UserEntity(props);
  }

  public changePassword(newPassword: string): void {
    if (newPassword.length < 6) throw new Error('Invalid password length.');
    this.password = newPassword;
  }

  public deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }

  public activate(): void {
    this.status = UserStatus.ACTIVE;
  }

  public updateProfile(name: string): void {
    if (!name.trim()) throw new Error('Name cannot be empty.');
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
