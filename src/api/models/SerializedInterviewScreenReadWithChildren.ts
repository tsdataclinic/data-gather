/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedConditionalActionRead } from './SerializedConditionalActionRead';
import type { SerializedInterviewScreenEntryRead } from './SerializedInterviewScreenEntryRead';

/**
 * The InterviewScreenRead model including any nested children
 * (actions and entries)
 */
export type SerializedInterviewScreenReadWithChildren = {
  order: number;
  headerText: any;
  title: any;
  isInStartingState: boolean;
  startingStateOrder?: number;
  interviewId: string;
  id: string;
  actions?: Array<SerializedConditionalActionRead>;
  entries?: Array<SerializedInterviewScreenEntryRead>;
};

