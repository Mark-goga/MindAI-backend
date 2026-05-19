import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const semverRegex = /^\d+\.\d+\.\d+$/;

const uploadBinarySchema = z.object({
  appId: z.string().trim().min(1).max(50),
  version: z.string().regex(semverRegex, 'Must be a valid semver (e.g. 1.2.3)'),
});

export class UploadBinaryDto extends createZodDto(uploadBinarySchema) {}
