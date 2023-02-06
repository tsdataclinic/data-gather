/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InterviewSettingType } from './InterviewSettingType';
import type { SerializedAirtableSettings } from './SerializedAirtableSettings';

/**
 * The InterviewSetting model used in HTTP responses when reading
 * from the database. Any API functions that return a InterviewSetting
 * should respond with a InterviewSettingRead model or one of its
 * subclasses.
 *
 * `id` is not optional because it must exist already if it's in the database.
 */
export type SerializedInterviewSettingRead = {
  type: InterviewSettingType;
  settings: Record<string, SerializedAirtableSettings>;
  interviewId: string;
  id: string;
};

