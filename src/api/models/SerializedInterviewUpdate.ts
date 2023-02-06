/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedInterviewSettingCreate } from './SerializedInterviewSettingCreate';
import type { SerializedInterviewSettingRead } from './SerializedInterviewSettingRead';
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
  id: string;
  createdDate: string;
  submissionActions: Array<(SerializedSubmissionActionRead | SerializedSubmissionActionCreate)>;
  interviewSettings: Array<(SerializedInterviewSettingRead | SerializedInterviewSettingCreate)>;
};

