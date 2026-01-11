// todo: why do i need `exp` and `expiresAt`? they seem redundant and confusing. Also, should this type be an Entity
//  instead of a schema? If it should remain as a schema, then should `SessionTokenClaims` be an Entity instead of a
//  `DTO`?
export type SessionClaimsSchema<R = string> = {
  exp: number;
  expiresAt: number;
  iat: number;
  role: R;
  sessionStart: number;
  userId: string;
};
