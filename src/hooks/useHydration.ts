'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect hydration status
 * Returns false during SSR and on initial client render (before hydration)
 * Returns true after the component has been hydrated
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

/**
 * Hook to safely access localStorage/persisted state
 * Returns the defaultValue during SSR and initial render
 * Returns the actual value after hydration
 */
export function useHydratedState<T>(store: () => T, defaultValue: T): T {
  const hydrated = useHydration();
  const storeValue = store();

  if (!hydrated) {
    return defaultValue;
  }

  return storeValue;
}

export default useHydration;
