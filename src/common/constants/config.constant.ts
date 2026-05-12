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

  // DATABASE_URL: z.string().url(),
  // JWT_SECRET: z.string().min(10),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Error in env:', parsedEnv.error.format());
  process.exit(1);
}

export const CONFIG = parsedEnv.data;

export type AppConfig = z.infer<typeof envSchema>;
