type CacheEntry<T> = {
  value: T;
  fetchedAt: number;
  ttl: number; // milliseconds
};

export function setCached<T>(key: string, value: T, ttlSeconds = 3600) {
  try {
    const entry: CacheEntry<T> = { value, fetchedAt: Date.now(), ttl: ttlSeconds * 1000 };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    // ignore storage errors
    console.warn('setCached failed', e);
  }
}

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.value;
  } catch (e) {
    console.warn('getCached failed', e);
    return null;
  }
}

export function removeCached(key: string) {
  try { localStorage.removeItem(key); } catch {};
}
