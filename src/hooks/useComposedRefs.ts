import * as React from 'react';
import { useObjectRef } from '@react-aria/utils';

export default function useComposedRefs<T>(
  ...refs: ReadonlyArray<React.Ref<T> | undefined>
): React.MutableRefObject<T> {
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

  return useObjectRef(callbackRef);
}
