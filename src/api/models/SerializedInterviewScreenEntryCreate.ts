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
  prompt: Record<string, string>;
  required?: boolean;
  responseKey: string;
  responseType: ResponseType;
  responseTypeOptions: any;
  screenId: string;
  text: Record<string, string>;
  id?: string;
};

