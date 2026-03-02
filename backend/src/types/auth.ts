export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export type UserRole = 'USER' | 'COMPANY_HR' | 'EVENT_HOST' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role?: UserRole;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}
