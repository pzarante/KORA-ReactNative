import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { AsyncStorageCache, CACHE_TTL_MS } from "@/src/shared/storage/AsyncStorageCache";

/** Runs `load` every time the screen gains focus, so lists refresh after creating or answering something. */
export function useFocusLoad<T>(
  load: () => Promise<T>,
  deps: unknown[],
  options: { cacheKey?: string; enabled?: boolean; ttlMs?: number } = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const cacheKey = options.cacheKey;
  const enabled = options.enabled ?? true;
  const ttlMs = options.ttlMs ?? CACHE_TTL_MS;

  const run = useCallback((force = false) => {
    let active = true;
    const execute = async () => {
      if (!enabled) return;
      const cached = cacheKey ? await AsyncStorageCache.read<T>(cacheKey, ttlMs) : null;
      if (active && cached) setData(cached.value);
      if (!force && cached?.fresh) {
        if (active) setError(null);
        return;
      }

      if (active) setRefreshing(true);
      try {
        const value = await load();
        if (!active) return;
        setData(value);
        setError(null);
        if (cacheKey) await AsyncStorageCache.write(cacheKey, value);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "No se pudo cargar la información");
        if (active && !cached) {
          const fallback = cacheKey ? await AsyncStorageCache.read<T>(cacheKey, ttlMs) : null;
          if (fallback) setData(fallback.value);
        }
      } finally {
        if (active) setRefreshing(false);
      }
    };
    void execute();
    return () => {
      active = false;
    };
    // The dependency list is supplied by the caller so this hook can support arbitrary load signatures.
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  }, deps);
  const focusRun = useCallback(() => run(false), [run]);
  const reload = useCallback(() => {
    run(true);
  }, [run]);
  useFocusEffect(focusRun);
  return { data, error, refreshing, reload };
}
