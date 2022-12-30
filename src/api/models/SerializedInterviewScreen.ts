/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The InterviewScreen model as a database table.
 */
export type SerializedInterviewScreen = {
  order: number;
  headerText: string;
  title: string;
  isInStartingState: boolean;
  startingStateOrder?: number;
  interviewId: string;
  id?: string;
};

