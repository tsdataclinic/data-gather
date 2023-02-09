/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedSubmissionActionCreate } from './SerializedSubmissionActionCreate';
import type { SerializedSubmissionActionRead } from './SerializedSubmissionActionRead';

/**
 * The Interview model used on update requests. This model allows updating
 * the nested submissionActions.
 */
export type SerializedInterviewUpdate = {
  description: string;
  name: string;
  notes: string;
  vanityUrl?: string;
  published: boolean;
  ownerId: string;
  defaultLanguage: string;
  allowedLanguages: string;
  id: string;
  createdDate: string;
  submissionActions: Array<(SerializedSubmissionActionRead | SerializedSubmissionActionCreate)>;
};

