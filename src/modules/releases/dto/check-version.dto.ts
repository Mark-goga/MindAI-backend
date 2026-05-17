import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const semverRegex = /^\d+\.\d+\.\d+$/;

const checkVersionSchema = z.object({
  appId: z.string().trim().min(1).max(50),
  platform: z.enum(['ios', 'android', 'desktop_win', 'desktop_mac', 'web']),
  version: z.string().regex(semverRegex, 'Must be a valid semver (e.g. 1.2.3)'),
});

export class CheckVersionDto extends createZodDto(checkVersionSchema) {}
