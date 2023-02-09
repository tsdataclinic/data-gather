import * as React from 'react';

export default function useRefMap<V>(
  keys: readonly string[],
  initialValue: V,
): Map<string, React.MutableRefObject<V>> {
  const refMap = React.useMemo(
    () => new Map(keys.map(key => [key, { current: initialValue }])),
    [keys, initialValue],
  );

  return refMap;
}
