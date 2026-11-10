import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

/** Runs `load` every time the screen gains focus, so lists refresh after creating or answering something. */
export function useFocusLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(() => {
    let active = true;
    load()
      .then((value) => active && (setData(value), setError(null)))
      .catch((err) => active && setError(err?.message ?? "No se pudo cargar la información"));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useFocusEffect(run);
  return { data, error, reload: run };
}
