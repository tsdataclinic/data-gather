/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InterviewSettingType } from './InterviewSettingType';
import type { SerializedAirtableSettings } from './SerializedAirtableSettings';

/**
 * The InterviewSetting model used when creating a new model.
 * `id` is optional because it is set by the database.
 */
export type SerializedInterviewSettingCreate = {
  type: InterviewSettingType;
  settings: SerializedAirtableSettings;
  interviewId: string;
  id?: string;
};

