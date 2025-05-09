import { useCallback } from "react";
import { useBoolean, useMount, useUnmount } from "react-use";

export function useTyping() {
  const [typing, setTyping] = useBoolean(false);
  const keyDown = useCallback(() => setTyping(true), [setTyping]);
  const keyUp = useCallback(() => setTyping(false), [setTyping]);
  useMount(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", keyDown);
      window.addEventListener("keyup", keyUp);
    }
  });
  useUnmount(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    }
  });

  return typing;
}
