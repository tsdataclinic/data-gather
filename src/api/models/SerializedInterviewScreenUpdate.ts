/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedConditionalActionCreate } from './SerializedConditionalActionCreate';
import type { SerializedConditionalActionRead } from './SerializedConditionalActionRead';
import type { SerializedInterviewScreenEntryCreate } from './SerializedInterviewScreenEntryCreate';
import type { SerializedInterviewScreenEntryRead } from './SerializedInterviewScreenEntryRead';

/**
 * The InterviewScreen model used on update requests.
 * We allow nested updates (passing the nested actions and entries) and we also
 * allow creating new actions and entries with this update.
 */
export type SerializedInterviewScreenUpdate = {
  order: number;
  headerText: string;
  title: string;
  isInStartingState: boolean;
  startingStateOrder?: number;
  interviewId: string;
  id: string;
  actions: Array<(SerializedConditionalActionRead | SerializedConditionalActionCreate)>;
  entries: Array<(SerializedInterviewScreenEntryRead | SerializedInterviewScreenEntryCreate)>;
};

