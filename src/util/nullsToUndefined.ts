type NullToUndefined<T> = T extends null ? Exclude<T, null> | undefined : T;

/**
 * Helper function to convert all `null` values in an object to `undefined`
 * This is useful when receiving an HTTP response. JSON responses can contain
 * `null` values, but `undefined` is the more predictable bottom value in JS.
 * So when receiving an HTTP response, calling `nullsToUndefined(obj)` gives
 * a quick way to convert all nulls to undefineds.
 *
 * **NOTE:** this only does a shallow conversion. If this contains nested
 * objects or arrays we will not convert any null values inside there.
 * This function will need to be updated to handle that if necessary.
 */
export default function nullsToUndefined<T extends Record<string, unknown>>(
  obj: T,
): {
  [K in keyof T]: NullToUndefined<T[K]>;
} {
  const newObj: Record<string, unknown> = {};

  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (val === null) {
      newObj[key] = undefined;
    } else {
      newObj[key] = val;
    }
  });

  return newObj as { [K in keyof T]: NullToUndefined<T[K]> };
}
