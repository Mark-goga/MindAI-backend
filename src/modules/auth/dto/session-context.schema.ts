import { z } from 'zod';
import { PLATFORM_VALUES } from '@common/database/schema';

export const sessionContextSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/),
  platform: z.enum(PLATFORM_VALUES).optional(),
  deviceId: z.string().trim().min(2).max(255).optional(),
});
