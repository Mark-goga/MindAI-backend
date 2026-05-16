export const ENDPOINTS = {
  HEALTH: {
    BASE: 'health',
    STATUS: {
      ENDPOINT: 'status',
      DOCKS: {
        summary: 'Check API status',
        description: 'Returns service status and current app version',
      },
    },
  },
  AUTH: {
    BASE: 'auth',
    REGISTER: {
      ENDPOINT: 'register',
      DOCKS: {
        summary: 'Register user',
        description:
          'Creates a user and starts an authenticated session for one application',
      },
    },
    LOGIN: {
      ENDPOINT: 'login',
      DOCKS: {
        summary: 'Login user',
        description:
          'Authenticates a user and returns access and refresh tokens for one application',
      },
    },
    REFRESH: {
      ENDPOINT: 'refresh',
      DOCKS: {
        summary: 'Refresh tokens',
        description:
          'Rotates the refresh token for the current session. The refresh token is expected in the request body.',
      },
    },
    ME: {
      ENDPOINT: 'me',
      DOCKS: {
        summary: 'Get current user',
        description: 'Returns the authenticated user and current session',
      },
    },
    LOGOUT: {
      ENDPOINT: 'logout',
      DOCKS: {
        summary: 'Logout current session',
        description: 'Revokes the current session for the authenticated user',
      },
    },
    SESSIONS: {
      BASE: 'sessions',
      LIST: {
        ENDPOINT: '',
        DOCKS: {
          summary: 'List sessions',
          description:
            'Lists the current user sessions within the current application scope',
        },
      },
      REVOKE_ONE: {
        ENDPOINT: ':sessionId',
        DOCKS: {
          summary: 'Revoke one session',
          description:
            'Revokes a single session inside the current application scope',
        },
      },
      REVOKE_OTHERS: {
        ENDPOINT: 'others',
        DOCKS: {
          summary: 'Revoke other sessions',
          description:
            'Revokes all other sessions inside the current application scope except the current one',
        },
      },
    },
  },
} as const;
