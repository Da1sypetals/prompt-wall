import { Redis } from '@upstash/redis';

export const PROMPT_WALL_KEY = 'prompt-wall';

// Check if we're in build/static generation phase
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                     process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.UPSTASH_REDIS_REST_URL?.startsWith('https');

// Create Redis client or mock for build phase
function createRedisClient() {
  if (isBuildPhase) {
    // Mock Redis client for build phase
    return {
      get: async () => null,
      set: async () => null,
    } as unknown as Redis;
  }
  return Redis.fromEnv();
}

export const redis = createRedisClient();

export async function getPromptWallData(): Promise<{ prompts: any[] }> {
  try {
    const data = await redis.get(PROMPT_WALL_KEY);
    if (!data) {
      return { prompts: [] };
    }
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed && Array.isArray(parsed.prompts) ? parsed : { prompts: [] };
  } catch (error) {
    console.error('Redis get error:', error);
    return { prompts: [] };
  }
}

export async function setPromptWallData(data: { prompts: any[] }): Promise<void> {
  try {
    await redis.set(PROMPT_WALL_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Redis set error:', error);
    throw error;
  }
}
