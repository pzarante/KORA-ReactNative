import { useEffect, useRef, useState } from "react";

/**
 * While `active`, the back button, Android back and swipe ask first instead of leaving.
 * Render a ConfirmModal with `visible={exitPending}` wired to `confirmExit` / `cancelExit`,
 * and call `allowLeave()` before navigating away on purpose (e.g. after saving).
 */
export function useConfirmLeave(navigation: any, active: boolean) {
  const [pending, setPending] = useState<any>(null);
  const leaving = useRef(false);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e: any) => {
        if (!active || leaving.current) return;
        e.preventDefault();
        setPending(e.data.action);
      }),
    [navigation, active],
  );

  return {
    exitPending: !!pending,
    allowLeave: () => {
      leaving.current = true;
    },
    confirmExit: () => {
      leaving.current = true;
      navigation.dispatch(pending);
    },
    cancelExit: () => setPending(null),
  };
}
