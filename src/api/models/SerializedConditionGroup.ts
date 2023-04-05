/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ConditionGroupType } from './ConditionGroupType';
import type { SerializedSingleCondition } from './SerializedSingleCondition';

export type SerializedConditionGroup = {
  type: ConditionGroupType;
  conditions: Array<(SerializedConditionGroup | SerializedSingleCondition)>;
  id: string;
};

