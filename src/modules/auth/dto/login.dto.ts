import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { sessionContextSchema } from './session-context.schema';

const loginSchema = sessionContextSchema.extend({
  email: z
    .email()
    .trim()
    .transform(value => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export class LoginDto extends createZodDto(loginSchema) {}
