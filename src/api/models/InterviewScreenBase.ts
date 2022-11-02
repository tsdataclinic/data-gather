/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Any models that are returned in our REST API should extend this class
 */
export type InterviewScreenBase = {
  order: number;
  headerText: string;
  id: string;
  interviewId: string;
  title: string;
  isInStartingState: boolean;
  startingStateOrder: number;
};

