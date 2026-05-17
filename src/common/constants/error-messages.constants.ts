export const ERROR_MESSAGES = {
  AUTH: {
    AUTHORIZATION_NOT_FOUND: 'Authorization header is missing.',
    AUTHORIZATION_INVALID: 'Authorization header must use the Bearer scheme.',
    INVALID_OR_EXPIRED_TOKEN: 'Token is invalid or expired.',
    INVALID_CREDENTIALS: 'Email or password is invalid.',
    SESSION_NOT_FOUND: 'Session was not found.',
    SESSION_REVOKED: 'Session is revoked or expired.',
    REFRESH_TOKEN_REQUIRED: 'Refresh token is required in the request body.',
  },
  USER: {
    EMAIL_ALREADY_EXISTS: 'User with this email already exists.',
    USER_NOT_FOUND: 'User was not found.',
  },
  RELEASES: {
    FORBIDDEN: 'Insufficient permissions to perform this action.',
    NOT_FOUND: 'Release was not found.',
    VERSION_CONFLICT: 'A release with this version already exists for this app and platform.',
  },
} as const;
