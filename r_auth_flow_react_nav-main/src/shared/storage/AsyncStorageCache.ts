import AsyncStorage from "@react-native-async-storage/async-storage";

type CacheEntry<T> = {
  value: T;
  timestamp: number;
};

export type CachedValue<T> = CacheEntry<T> & { fresh: boolean };

const CACHE_PREFIX = "kora:cache:v1:";
export const CACHE_TTL_MS = 60_000;

export class AsyncStorageCache {
  static async read<T>(key: string, ttlMs = CACHE_TTL_MS): Promise<CachedValue<T> | null> {
    const storageKey = `${CACHE_PREFIX}${key}`;
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (typeof entry.timestamp !== "number" || !("value" in entry)) {
        await AsyncStorage.removeItem(storageKey);
        return null;
      }
      return { ...entry, fresh: Date.now() - entry.timestamp < ttlMs };
    } catch (error) {
      console.error(`Error reading cache for ${key}`, error);
      return null;
    }
  }

  static async write<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify({ value, timestamp: Date.now() } satisfies CacheEntry<T>),
      );
    } catch (error) {
      console.error(`Error writing cache for ${key}`, error);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error(`Error removing cache for ${key}`, error);
    }
  }
}
