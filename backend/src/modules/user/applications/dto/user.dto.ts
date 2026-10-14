export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface UpdateProfileInput {
  name?: string;
  avatar?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}
