/**
 * This interface can be used to extend other interfaces to make them indexable.
 * This allows an interface to be used in places that expect a Record<> type.
 */
export interface Indexable<T = unknown> {
  [key: string]: T;
}
