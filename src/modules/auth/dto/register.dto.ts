import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { sessionContextSchema } from './session-context.schema';

const registerSchema = sessionContextSchema.extend({
  email: z
    .string()
    .trim()
    .email()
    .transform(value => value.toLowerCase()),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(128),
});

export class RegisterDto extends createZodDto(registerSchema) {}
