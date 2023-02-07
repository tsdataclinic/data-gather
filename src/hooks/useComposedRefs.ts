import * as React from 'react';

export default function useComposedRefs<T>(
  ...refs: ReadonlyArray<React.Ref<T> | undefined>
): React.MutableRefObject<T | null> {
  // create a callback ref that will cycle through each of our component
  // refs and assign the ref val appropriately
  const callbackRef = React.useCallback((refVal: T | null) => {
    refs.forEach(ref => {
      if (ref === undefined || ref === null) {
        return;
      }

      if (typeof ref === 'function') {
        ref(refVal);
      }

      if (typeof ref === 'object') {
        // assume that the ref is a ref object in this case
        // eslint-disable-next-line no-param-reassign
        (ref as React.MutableRefObject<T | null>).current = refVal;
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);

  // Create a stable object ref to represent our merged ref, but make sure
  // it keeps all its component refs in sync by calling `callbackRef` whenever
  // the ref value is updated. Inspired by the solution from this blog post:
  // https://blog.thoughtspile.tech/2021/05/17/everything-about-react-refs/
  const stableRef = React.useRef<T | null>(null);
  const mergedRef = React.useMemo(
    () => ({
      get current() {
        return stableRef.current;
      },
      set current(el: T | null) {
        stableRef.current = el;
        callbackRef(el);
      },
    }),
    [callbackRef],
  );
  return mergedRef;
}
