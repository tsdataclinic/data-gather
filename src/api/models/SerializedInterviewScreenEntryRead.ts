/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ResponseType } from './ResponseType';
import type { SerializedAirtableOptions } from './SerializedAirtableOptions';
import type { SerializedSingleSelectOptions } from './SerializedSingleSelectOptions';

/**
 * The InterviewScreenEntry model used in HTTP responses when reading
 * from the database.
 *
 * `id` is not optional because it must exist already if it's in the database.
 */
export type SerializedInterviewScreenEntryRead = {
  order: number;
  name: string;
  prompt: Record<string, string>;
  required?: boolean;
  responseKey: string;
  responseType: ResponseType;
  responseTypeOptions?: (SerializedAirtableOptions | SerializedSingleSelectOptions);
  screenId: string;
  text: Record<string, string>;
  id: string;
};

