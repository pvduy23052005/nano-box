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
