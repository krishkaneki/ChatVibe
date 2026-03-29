import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const setOnline = async (userId: string): Promise<void> => {
  await redis.set(`online:${userId}`, '1', { ex: 300 });
};

export const setOffline = async (userId: string): Promise<void> => {
  await redis.del(`online:${userId}`);
};

export const isOnline = async (userId: string): Promise<boolean> => {
  const val = await redis.get(`online:${userId}`);
  return val === '1';
};

export const getOnlineUsers = async (userIds: string[]): Promise<string[]> => {
  if (!userIds.length) return [];
  const keys = userIds.map((id) => `online:${id}`);
  const values = await redis.mget<string[]>(...keys);
  return userIds.filter((_, i) => values[i] === '1');
};

export default redis;
