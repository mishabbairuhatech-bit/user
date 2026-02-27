export interface JwtPayload {
  sub: string;
  email: string;
  session_id: string;
}

export interface JwtRefreshPayload {
  sub: string;
  session_id: string;
  refresh_token: string;
}

export interface MfaTokenPayload {
  sub: string;
  type: 'mfa';
}

export interface RequestUser {
  id: string;
  email: string;
  session_id: string;
}
