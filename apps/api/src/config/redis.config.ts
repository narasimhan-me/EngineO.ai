// apps/api/src/config/redis.config.ts
export const redisConfig = {
  url: process.env.REDIS_URL!, // must be provided in env for queues to work
  prefix: process.env.REDIS_PREFIX ?? 'engineo',
};
