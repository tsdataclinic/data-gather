/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedActionConfig } from './SerializedActionConfig';
import type { SerializedConditionGroup } from './SerializedConditionGroup';

/**
 * An IfClause represents the following logic:
 * if (condition) then `action`
 * else `action`
 *
 * The else clause could nest another IfClause in it
 * recursively.
 *
 * In other words, every IfClause executes an action if true, otherwise
 * it executes a different action or it evaluates another IfClause.
 */
export type SerializedIfClause = {
  action: SerializedActionConfig;
  conditionGroup: SerializedConditionGroup;
  elseClause: (SerializedActionConfig | SerializedIfClause);
  id: string;
};

