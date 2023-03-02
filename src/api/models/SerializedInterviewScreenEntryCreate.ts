/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ResponseType } from './ResponseType';
import type { SerializedAirtableOptions } from './SerializedAirtableOptions';
import type { SerializedSingleSelectOptions } from './SerializedSingleSelectOptions';

/**
 * The InterviewScreenEntry model used when creating a new model.
 * `id` is optional because it is set by the database.
 */
export type SerializedInterviewScreenEntryCreate = {
  order: number;
  name: string;
  prompt: Record<string, string>;
  required?: boolean;
  responseKey: string;
  responseType: ResponseType;
  responseTypeOptions?: (SerializedAirtableOptions | SerializedSingleSelectOptions);
  screenId: string;
  text: Record<string, string>;
  id?: string;
};

