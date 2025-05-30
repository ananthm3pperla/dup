interface CacheItem<T> {
  value: T;
  timestamp: number;
}

export class MemoryCache<T = any> {
  private cache: Map<string, CacheItem<T>>;
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) { // Default TTL: 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}