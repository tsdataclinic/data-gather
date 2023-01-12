/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActionType } from './ActionType';
import type { ConditionalOperator } from './ConditionalOperator';

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
  actionPayload: string;
  actionType: ActionType;
  conditionalOperator: ConditionalOperator;
  responseKey?: string;
  responseKeyField?: string;
  screenId: string;
  value?: string;
  id: string;
};

