/**
 * This function narrows a type to exclude null and undefined.
 */
export default function isNonNullable<T>(x: T): x is NonNullable<T> {
  return x !== null && x !== undefined;
}
