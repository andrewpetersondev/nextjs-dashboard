export type AuthJwtDto<R = string> = {
  exp: number;
  expiresAt: number;
  iat: number;
  role: R;
  sessionStart: number;
  userId: string;
};
