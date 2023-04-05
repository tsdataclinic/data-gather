/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedIfClause } from './SerializedIfClause';

/**
 * The ConditionalAction model used in HTTP responses when reading
 * from the database. Any API functions that return a ConditionalAction
 * should respond with a ConditionalActionRead model or one of its
 * subclasses.
 *
 * `id` is not optional because it must exist already if it's in the database.
 */
export type SerializedConditionalActionRead = {
  order: number;
  ifClause: SerializedIfClause;
  screenId: string;
  id: string;
};

