export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}
