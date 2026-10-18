import { useSyncExternalStore } from 'react';

function subscribeTo(query) {
  return (onChange) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  };
}

export function useMediaQuery(query) {
  return useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
