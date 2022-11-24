/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ConditionalActionBase } from './ConditionalActionBase';
import type { InterviewScreenEntryBase } from './InterviewScreenEntryBase';

/**
 * Any models that are returned in our REST API should extend this class.
 * This class handles any snake_case to camelCase conversions.
 */
export type InterviewScreenWithActionsAndEntries = {
  order: number;
  actions: Array<ConditionalActionBase>;
  entries: Array<InterviewScreenEntryBase>;
  id?: string;
  headerText: string;
  interviewId: string;
  title: string;
  isInStartingState: boolean;
  startingStateOrder?: number;
};

