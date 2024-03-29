/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedEditRowPayload } from './SerializedEditRowPayload';
import type { SerializedEntryResponseLookupConfig } from './SerializedEntryResponseLookupConfig';
import type { SerializedInsertRowPayload } from './SerializedInsertRowPayload';
import type { SubmissionActionType } from './SubmissionActionType';

/**
 * The SubmissionAction model used in HTTP responses when reading
 * from the database. Any API functions that return a SubmissionAction
 * should respond with a SubmissionActionRead model or one of its
 * subclasses.
 *
 * `id` is not optional because it must exist already if it's in the database.
 */
export type SerializedSubmissionActionRead = {
  order: number;
  type: SubmissionActionType;
  interviewId: string;
  fieldMappings: Record<string, SerializedEntryResponseLookupConfig>;
  payload: (SerializedEditRowPayload | SerializedInsertRowPayload);
  id: string;
};

