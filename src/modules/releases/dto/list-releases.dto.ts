import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PLATFORM_VALUES } from '@common/database/schema';

const listReleasesSchema = z.object({
  appId: z.string().trim().min(1).max(50).optional(),
  platform: z.enum(PLATFORM_VALUES).optional(),
});

export class ListReleasesDto extends createZodDto(listReleasesSchema) {}
