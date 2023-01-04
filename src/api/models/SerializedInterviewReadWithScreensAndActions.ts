/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedInterviewScreenRead } from './SerializedInterviewScreenRead';
import type { SerializedSubmissionActionRead } from './SerializedSubmissionActionRead';

/**
 * The InterviewRead model including nested screens.
 */
export type SerializedInterviewReadWithScreensAndActions = {
  description: string;
  name: string;
  notes: string;
  vanityUrl?: string;
  published: boolean;
  ownerId: string;
  id: string;
  createdDate: string;
  screens?: Array<SerializedInterviewScreenRead>;
  submissionActions?: Array<SerializedSubmissionActionRead>;
};

