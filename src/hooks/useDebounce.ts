import { useRef, useEffect, useState, useCallback } from 'react';

export function useDebounce<T>(initialValue: T, delayMs: number): T {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    const trackDelay = setTimeout(() => setValue(initialValue), delayMs);
    return () => clearTimeout(trackDelay);
  }, [initialValue, delayMs]);
  return value;
}

export function useDebouncedState<T>(
  initialValue: T,
  delayMs: number,
): [T, (newValue: T) => void] {
  const [value, setValue] = useState(initialValue);
  const debounceValue = useDebounce(value, delayMs);
  return [debounceValue, setValue];
}

/**
 * Return a debounced function. The function will only be evaluated when it
 * hasn't been called after `delayMs` ms.
 * @param {Function} func The function to be called
 * @param {number} delayMs How many ms to delay before calling the function
 * @returns {Function} The debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  func: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  // Use a ref to store the timeout between renders
  // and prevent changes to it from causing re-renders
  const timeout = useRef<NodeJS.Timeout | undefined>();

  return useCallback(
    (...args: Parameters<T>): void => {
      clearTimeout(timeout.current);

      timeout.current = setTimeout(() => {
        clearTimeout(timeout.current);

        // finally call the debounced function after `delayMs`
        func(...args);
      }, delayMs);
    },
    [func, delayMs],
  );
}
