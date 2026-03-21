export interface AuthUser {
  username: string;
  displayName: string;
  role: 'admin';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SessionResponse {
  user: AuthUser;
  expiresAt: string;
}

export interface AuthSessionResponse extends SessionResponse {
  token: string;
}
