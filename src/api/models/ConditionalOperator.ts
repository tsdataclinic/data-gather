/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The different types of conditional operator that can be used for a
 * ConditionalAction
 */
export enum ConditionalOperator {
  AFTER_OR_EQUAL = 'after_or_equal',
  AFTER = 'after',
  EQUALS_DATE = 'equals_date',
  BEFORE = 'before',
  BEFORE_OR_EQUAL = 'before_or_equal',
  ALWAYS_EXECUTE = 'always_execute',
  EQ = 'eq',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
}
