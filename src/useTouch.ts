import { useState, useRef, useEffect } from 'react';

export function useTouch(onEnd: (dx: number) => void) {
  const [startX, setStartX] = useState(NaN);
  const [currentX, setCurrentX] = useState(0);

  const onEndRef = useRef(() => onEnd(NaN));

  useEffect(() => {
    const cb_start = (e: TouchEvent) => {
      setStartX(e.touches[0].screenX);
      setCurrentX(e.touches[0].screenX);
    };

    document.addEventListener("touchstart", cb_start);

    const cb_move = (e: TouchEvent) => {
      setCurrentX(e.touches[0].screenX);
    };

    document.addEventListener("touchmove", cb_move);

    const cb_end = () => {
      onEndRef.current();
      setStartX(NaN);
    };

    document.addEventListener("touchend", cb_end, false);
    document.addEventListener("touchcancel", cb_end, false);

    return () => {
      document.removeEventListener("touchstart", cb_start);
      document.removeEventListener("touchmove", cb_move);
      document.removeEventListener("touchend", cb_end);
      document.removeEventListener("touchcancel", cb_end);
    };

  }, []);

  const dx = currentX - startX;

  onEndRef.current = () => {
    onEnd(dx);
  };

  return [dx];
}
