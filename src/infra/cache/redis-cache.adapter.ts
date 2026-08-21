import { Redis } from "ioredis";
import type { ICacheRepository } from "../../domain/cache/cache.repository.js";
import { env } from "../env/env.js";

export class RedisCacheAdapter implements ICacheRepository {
  private readonly redis = new Redis(env.REDIS_URL);

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);

    return value ? (JSON.parse(value) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
