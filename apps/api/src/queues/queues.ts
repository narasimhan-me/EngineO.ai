// apps/api/src/queues/queues.ts
import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis.config';

// Only create the queue if Redis is configured
export const deoScoreQueue: Queue | null =
  redisConfig.isEnabled && redisConfig.connection
    ? new Queue('deo_score_queue', {
        connection: redisConfig.connection,
        prefix: redisConfig.prefix,
      })
    : null;

if (!redisConfig.isEnabled) {
  console.warn('[Queues] Redis not configured - queue functionality disabled');
} else {
  console.log('[Queues] Redis queue initialized with host:', redisConfig.connection?.host);
}
