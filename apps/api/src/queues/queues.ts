// apps/api/src/queues/queues.ts
import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis.config';

export const deoScoreQueue = new Queue('deo_score_queue', {
  connection: {
    url: redisConfig.url,
  },
  prefix: redisConfig.prefix,
});
