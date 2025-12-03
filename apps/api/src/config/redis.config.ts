// apps/api/src/config/redis.config.ts

function parseRedisUrl(url: string | undefined) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const port = parseInt(parsed.port, 10) || 6379;
    const password = parsed.password || undefined;
    const username = parsed.username || undefined;

    // Upstash and other cloud Redis providers require TLS
    const requiresTls =
      host.includes('upstash.io') ||
      host.includes('redis.cloud') ||
      host.includes('redislabs.com') ||
      url.startsWith('rediss://');

    return {
      host,
      port,
      password,
      username,
      tls: requiresTls ? {} : undefined,
    };
  } catch {
    console.error('[Redis] Failed to parse REDIS_URL:', url);
    return null;
  }
}

const parsedConfig = parseRedisUrl(process.env.REDIS_URL);

export const redisConfig = {
  url: process.env.REDIS_URL || null,
  connection: parsedConfig,
  prefix: process.env.REDIS_PREFIX ?? 'engineo',
  isEnabled: !!parsedConfig,
};
