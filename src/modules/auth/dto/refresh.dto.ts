import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export class RefreshDto extends createZodDto(refreshSchema) {}
