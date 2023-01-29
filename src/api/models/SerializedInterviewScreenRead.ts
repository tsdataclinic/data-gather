/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The InterviewScreen model used in HTTP responses when reading from the
 * database.
 *
 * `id` is not optional because it must exist already if it's in the database.
 */
export type SerializedInterviewScreenRead = {
  order: number;
  headerText: string;
  title: any;
  isInStartingState: boolean;
  startingStateOrder?: number;
  interviewId: string;
  id: string;
};

