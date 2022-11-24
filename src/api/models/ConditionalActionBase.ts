/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActionType } from './ActionType';
import type { ConditionalOperator } from './ConditionalOperator';

/**
 * Any models that are returned in our REST API should extend this class.
 * This class handles any snake_case to camelCase conversions.
 */
export type ConditionalActionBase = {
  order: number;
  id?: string;
  actionPayload: string;
  actionType: ActionType;
  conditionalOperator: ConditionalOperator;
  responseKey: string;
  screenId: string;
  value: string;
};

