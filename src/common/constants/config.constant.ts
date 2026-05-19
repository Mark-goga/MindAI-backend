import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const RELEASE_BINARY_MAX_SIZE_BYTES = 400 * 1024 * 1024;

export enum NODE_ENV {
  PROD = 'prod',
  DEV = 'dev',
  TEST = 'test',
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.nativeEnum(NODE_ENV).default(NODE_ENV.DEV),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
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
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.url(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Error in env:', parsedEnv.error.format());
  process.exit(1);
}

export const CONFIG = parsedEnv.data;

export type AppConfig = z.infer<typeof envSchema>;
