export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export type JwtTokenPayload = {
  sub: string;
  sessionId: string;
  applicationId: string;
  type: TokenType;
  iat?: number;
  exp?: number;
};
