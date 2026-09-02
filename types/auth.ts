// Authentication & Session Types
import { UserRoleType } from './database';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  full_name_ar?: string;
  avatar_url?: string;
  role: UserRoleType;
  company_id?: string;
  company_name?: string;
  branch_id?: string;
  is_active: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expires_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
