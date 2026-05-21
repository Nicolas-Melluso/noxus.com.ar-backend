import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().min(1).optional(),
  DB_PORT: z.coerce.number().int().positive().optional(),
  DB_NAME: z.string().min(1).optional(),
  DB_USER: z.string().min(1).optional(),
  DB_PASSWORD: z.string().min(1).optional(),
  H_HOST: z.string().min(1).default('localhost'),
  H_PORT: z.coerce.number().int().positive().default(3306),
  H_USER: z.string().min(1).optional(),
  H_PASS: z.string().min(1).optional(),
  H_DB_NAME: z.string().min(1).default('u119350622_dbprincipal'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL must be a valid URL')
    .default('https://noxus.com.ar'),
  CORS_ORIGINS: z.string().optional(),
  FEEDBACK_IP_SALT: z
    .string()
    .min(16, 'FEEDBACK_IP_SALT must be at least 16 characters'),
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
    .regex(/^\d+$/, 'BOT_USER_ID must be a numeric Twitch user ID'),
}).superRefine((env, ctx) => {
  if (!env.DB_USER && !env.H_USER) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DB_USER'],
      message: 'DB_USER is required',
    });
  }

  if (!env.DB_PASSWORD && !env.H_PASS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DB_PASSWORD'],
      message: 'DB_PASSWORD is required',
    });
  }
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

  const data = {
    ...result.data,
    DB_HOST: result.data.DB_HOST || result.data.H_HOST,
    DB_PORT: result.data.DB_PORT || result.data.H_PORT,
    DB_NAME: result.data.DB_NAME || result.data.H_DB_NAME,
    DB_USER: result.data.DB_USER || result.data.H_USER,
    DB_PASSWORD: result.data.DB_PASSWORD || result.data.H_PASS,
    H_HOST: result.data.DB_HOST || result.data.H_HOST,
    H_PORT: result.data.DB_PORT || result.data.H_PORT,
    H_DB_NAME: result.data.DB_NAME || result.data.H_DB_NAME,
    H_USER: result.data.DB_USER || result.data.H_USER,
    H_PASS: result.data.DB_PASSWORD || result.data.H_PASS,
  };

  for (const [key, value] of Object.entries(data)) {
    process.env[key] = String(value);
  }

  return data;
}
