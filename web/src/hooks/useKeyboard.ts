import { useState, useEffect } from 'react';

export function useKeyboard(pttKey: string = 'CapsLock') {
  const [pttActive, setPttActive] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === pttKey || e.key === pttKey) {
        e.preventDefault();
        setPttActive(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === pttKey || e.key === pttKey) {
        setPttActive(false);
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [pttKey]);

  return { pttActive };
}
