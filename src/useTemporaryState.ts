import { useState, useRef, useCallback } from "react";

export function useTemporaryState<T>(
  timeout: number = 1000,
  initialValue = null as T
): [T | null, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState(initialValue as T | null);
  const ref = useRef(null as Symbol | null);

  const setTemporaryState = useCallback(
    ((state: T) => {
      const symbol = Symbol();
      ref.current = symbol;

      setState(state);

      setTimeout(() => {
        if (ref.current === symbol) {
          setState(null);
        }
      }, timeout);
    }) as React.Dispatch<React.SetStateAction<T>>,
    [timeout]
  );

  return [state, setTemporaryState];
}
