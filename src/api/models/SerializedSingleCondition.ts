/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ConditionalOperator } from './ConditionalOperator';

export type SerializedSingleCondition = {
  conditionalOperator: ConditionalOperator;
  responseKey?: string;
  responseKeyLookupField?: string;
  value?: string;
  id: string;
};

