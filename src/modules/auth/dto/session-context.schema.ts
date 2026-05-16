import { z } from 'zod';

export const sessionContextSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/),
  platform: z.string().trim().min(2).max(20).optional(),
  deviceId: z.string().trim().min(2).max(255).optional(),
});
