import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export enum NODE_ENV {
  PROD = 'prod',
  DEV = 'dev',
  TEST = 'test',
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.nativeEnum(NODE_ENV).default(NODE_ENV.DEV),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgres://postgres:postgres@localhost:5432/mindai_backend'),
  JWT_ACCESS_SECRET: z.string().min(32).default('dev-access-secret-dev-access-secret'),
  JWT_REFRESH_SECRET: z.string().min(32).default('dev-refresh-secret-dev-refresh-secret'),
  JWT_ACCESS_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 15),
  JWT_REFRESH_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 30),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Error in env:', parsedEnv.error.format());
  process.exit(1);
}

export const CONFIG = parsedEnv.data;

export type AppConfig = z.infer<typeof envSchema>;
