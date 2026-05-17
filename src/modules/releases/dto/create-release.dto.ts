import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PLATFORM_VALUES } from '@common/database/schema';

const semverRegex = /^\d+\.\d+\.\d+$/;

const createReleaseSchema = z.object({
  appId: z.string().trim().min(1).max(50),
  platform: z.enum(PLATFORM_VALUES),
  version: z.string().regex(semverRegex, 'Must be a valid semver (e.g. 1.2.3)'),
  minVersion: z
    .string()
    .regex(semverRegex, 'Must be a valid semver (e.g. 1.2.3)'),
  isMandatory: z.boolean().default(false),
  isReleased: z.boolean().default(false),
  downloadUrl: z.string().url().optional(),
  storeUrl: z.string().url().optional(),
  releaseNotes: z.record(z.string(), z.string()).optional(),
});

export class CreateReleaseDto extends createZodDto(createReleaseSchema) {}
