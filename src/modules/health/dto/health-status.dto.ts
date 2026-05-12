import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const schema = z.object({
  test: z.string().nullable().optional(),
});

export class HealthStatusDto extends createZodDto(schema) {}
