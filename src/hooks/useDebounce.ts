import { useEffect, useState } from 'react';

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
