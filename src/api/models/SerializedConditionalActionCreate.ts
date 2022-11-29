/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActionType } from './ActionType';
import type { ConditionalOperator } from './ConditionalOperator';

/**
 * The ConditionalAction model used when creating a new model.
 * `id` is optional because it is set by the database.
 */
export type SerializedConditionalActionCreate = {
  order: number;
  actionPayload: string;
  actionType: ActionType;
  conditionalOperator: ConditionalOperator;
  responseKey?: string;
  screenId: string;
  value?: string;
  id?: string;
};

