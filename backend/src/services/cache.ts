import NodeCache from 'node-cache';

class CacheService {
  private cache: NodeCache;
  private defaultTTL: number;

  constructor() {
    this.defaultTTL = parseInt(process.env.CACHE_TTL || '3600');
    this.cache = new NodeCache({
      stdTTL: this.defaultTTL,
      checkperiod: 600,
      useClones: false,
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || this.defaultTTL);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${prefix}:${sortedParams}`;
  }
}

export default new CacheService();
