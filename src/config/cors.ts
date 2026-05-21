export function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '';

  return raw
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter((origin): origin is string => Boolean(origin));
}

export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  return getAllowedOrigins().includes(normalizeOrigin(origin));
}

function normalizeOrigin(origin: string): string {
  try {
    return new URL(origin).origin;
  } catch {
    return origin.replace(/\/+$/, '');
  }
}
