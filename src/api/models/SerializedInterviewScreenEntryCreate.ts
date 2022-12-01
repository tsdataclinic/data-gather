/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ResponseType } from './ResponseType';

/**
 * The InterviewScreenEntry model used when creating a new model.
 * `id` is optional because it is set by the database.
 */
export type SerializedInterviewScreenEntryCreate = {
  order: number;
  name: string;
  prompt: string;
  responseKey: string;
  responseType: ResponseType;
  responseTypeOptions: any;
  screenId: string;
  writebackOptions?: any;
  text: string;
  id?: string;
};

