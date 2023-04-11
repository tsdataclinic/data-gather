/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedIfClause } from './SerializedIfClause';

/**
 * The ConditionalAction model used when creating a new model.
 * `id` is optional because it is set by the database.
 */
export type SerializedConditionalActionCreate = {
  order: number;
  ifClause: SerializedIfClause;
  screenId: string;
  id?: string;
};

