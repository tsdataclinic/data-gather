/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Any models that are returned in our REST API should extend this class.
 * This class handles any snake_case to camelCase conversions.
 */
export type InterviewScreenBase = {
  order: number;
  id: string;
  headerText: string;
  interviewId: string;
  title: string;
  startingStateOrder: number;
};

