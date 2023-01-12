/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedEditRowPayload } from './SerializedEditRowPayload';
import type { SerializedEntryResponseLookupConfig } from './SerializedEntryResponseLookupConfig';
import type { SerializedInsertRowPayload } from './SerializedInsertRowPayload';
import type { SubmissionActionType } from './SubmissionActionType';

/**
 * The SubmissionAction model used when creating a new model.
 * `id` is optional because it is set by the database.
 */
export type SerializedSubmissionActionCreate = {
  order: number;
  type: SubmissionActionType;
  interviewId: string;
  fieldMappings: Record<string, SerializedEntryResponseLookupConfig>;
  payload: (SerializedEditRowPayload | SerializedInsertRowPayload);
  id?: string;
};

