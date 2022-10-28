/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedInterviewScreenRead } from './SerializedInterviewScreenRead';

/**
 * The InterviewRead model including nested screens.
 */
export type SerializedInterviewReadWithScreens = {
  description: string;
  name: string;
  notes: string;
  id: string;
  createdDate: string;
  screens?: Array<SerializedInterviewScreenRead>;
};
