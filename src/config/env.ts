import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  H_HOST: z.string().min(1, 'H_HOST is required'),
  H_PORT: z.coerce.number().int().positive().default(3306),
  H_USER: z.string().min(1, 'H_USER is required'),
  H_PASS: z.string().min(1, 'H_PASS is required'),
  H_DB_NAME: z.string().min(1, 'H_DB_NAME is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL must be a valid URL')
    .default('https://noxus.com.ar'),
  OAUTH2_CLIENT_ID: z.string().min(1, 'OAUTH2_CLIENT_ID is required'),
  OAUTH2_CLIENT_SECRET: z.string().min(1, 'OAUTH2_CLIENT_SECRET is required'),
  OAUTH2_CALLBACK_URL: z
    .string()
    .url('OAUTH2_CALLBACK_URL must be a valid URL')
    .default('http://localhost:3000/api/auth/oauth2/callback'),
  OAUTH2_AUTH_URL: z
    .string()
    .url('OAUTH2_AUTH_URL must be a valid URL')
    .default('https://example.com/oauth2/authorize'),
  OAUTH2_TOKEN_URL: z
    .string()
    .url('OAUTH2_TOKEN_URL must be a valid URL')
    .default('https://example.com/oauth2/token'),
  TWITCH_CLIENT_ID: z.string().min(1, 'TWITCH_CLIENT_ID is required'),
  TWITCH_CLIENT_SECRET: z.string().min(1, 'TWITCH_CLIENT_SECRET is required'),
  TWITCH_STREAMER_USERNAME: z
    .string()
    .min(1, 'TWITCH_STREAMER_USERNAME is required'),
  TWITCH_WEBHOOK_SECRET: z.string().min(1, 'TWITCH_WEBHOOK_SECRET is required'),
  TWITCH_BOT_REFRESH_TOKEN: z
    .string()
    .min(1, 'TWITCH_BOT_REFRESH_TOKEN is required'),
  TWITCH_REDIRECT_URI: z
    .string()
    .url('TWITCH_REDIRECT_URI must be a valid URL'),
  BOT_USER_ID: z
    .string()
    .regex(/^\d+$/, 'BOT_USER_ID must be a numeric Twitch user id'),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(rawEnv: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(rawEnv);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `- ${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
  }

  for (const [key, value] of Object.entries(result.data)) {
    process.env[key] = String(value);
  }

  return result.data;
}
