/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ResponseType } from './ResponseType';

/**
 * The InterviewScreenEntry model used in HTTP responses when reading
 * from the database.
 *
 * `id` is not optional because it must exist already if it's in the database.
 */
export type SerializedInterviewScreenEntryRead = {
  order: number;
  name: string;
  prompt: string;
  responseKey: string;
  responseType: ResponseType;
  responseTypeOptions: any;
  screenId: string;
  writebackOptions?: any;
  text: string;
  id: string;
};

