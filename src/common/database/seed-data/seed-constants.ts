export const SESSION_APPLICATIONS = [
  {
    applicationId: 'mindai.web',
    platform: 'web',
  },
  {
    applicationId: 'mindai.ios',
    platform: 'ios',
  },
  {
    applicationId: 'mindai.android',
    platform: 'android',
  },
] as const;

export const MIN_SESSIONS_PER_USER = 1;
export const MAX_SESSIONS_PER_USER = 4;
