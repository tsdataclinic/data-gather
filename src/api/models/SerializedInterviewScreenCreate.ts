/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The InterviewScreen model used when creating a new model.
 * `id` and `order` are optional because these are set by the database.
 */
export type SerializedInterviewScreenCreate = {
  order?: number;
  headerText: Record<string, string>;
  title: Record<string, string>;
  isInStartingState: boolean;
  startingStateOrder?: number;
  interviewId: string;
  id?: string;
};

