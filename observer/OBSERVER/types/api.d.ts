// TypeScript definitions for the API
export interface Account {
  id: string;
  title: string;
  type: '模拟盘' | '实盘' | string;
  visible: boolean;
  metadata?: Record<string, any>;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}
