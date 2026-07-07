export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  status?: UserStatus;
}
