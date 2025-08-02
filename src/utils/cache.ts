interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class Cache {
  private storage: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const timeToLive = ttl || this.defaultTTL;
    
    this.storage.set(key, {
      data,
      timestamp: now,
      expiresAt: now + timeToLive
    });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now > item.expiresAt) {
      this.storage.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.storage.get(key);
    
    if (!item) {
      return false;
    }

    const now = Date.now();
    
    if (now > item.expiresAt) {
      this.storage.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.storage.entries()) {
      if (now > item.expiresAt) {
        this.storage.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.storage.size,
      keys: Array.from(this.storage.keys())
    };
  }
}

// Create singleton instance
export const cache = new Cache();

// Cache keys constants
export const CACHE_KEYS = {
  POSTS: 'posts',
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  USER_POSTS: (userId: string) => `user_posts_${userId}`,
  CURRENT_USER: 'current_user'
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  POSTS: 2 * 60 * 1000,       // 2 minutes for posts
  PROFILES: 10 * 60 * 1000,   // 10 minutes for user profiles
  USER_PROFILE: 10 * 60 * 1000, // 10 minutes for user profile
  USER_POSTS: 5 * 60 * 1000,  // 5 minutes for user posts
  CURRENT_USER: 30 * 60 * 1000 // 30 minutes for current user
} as const;

// Auto cleanup every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);
