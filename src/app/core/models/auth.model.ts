export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: string;
}

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}