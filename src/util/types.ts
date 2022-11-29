/**
 * This file contains helpful utility types.
 */

/**
 * Change specified types in an object from optional to required.
 * E.g. `WithRequired<Obj, 'id' | 'name'>` will make the keys `id` and `name`
 * required in `Obj`.
 */
export type WithRequired<Obj, Key extends keyof Obj> = Obj & {
  [Property in Key]-?: Obj[Property];
};

/**
 * Change specified types in an object from required to optional.
 * E.g. `WithOptional<Obj, 'id' | 'name'>` will make the keys `id` and `name`
 * optional in `Obj`.
 */
export type WithOptional<Obj, Key extends keyof Obj> = Omit<Obj, Key> & {
  [Property in Key]+?: Obj[Property];
};

/**
 * Override the specified types in an object.
 * E.g. `Override<Obj, { foo: string, bar: string }` will change properties
 * `foo` and `bar` to be strings.
 */
export type Override<Obj, ReplacementObj> = Omit<Obj, keyof ReplacementObj> &
  ReplacementObj;
