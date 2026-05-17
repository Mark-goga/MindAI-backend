import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const listReleasesSchema = z.object({
  appId: z.string().trim().min(1).max(50).optional(),
  platform: z
    .enum(['ios', 'android', 'desktop_win', 'desktop_mac', 'web'])
    .optional(),
});

export class ListReleasesDto extends createZodDto(listReleasesSchema) {}
