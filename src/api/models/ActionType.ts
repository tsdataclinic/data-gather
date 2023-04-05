/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The different action types a ConditionalAction can be
 */
export enum ActionType {
  CHECKPOINT = 'checkpoint',
  DO_NOTHING = 'do_nothing',
  MILESTONE = 'milestone',
  PUSH = 'push',
  RESTORE = 'restore',
  SKIP = 'skip',
  END_INTERVIEW = 'end_interview',
}
