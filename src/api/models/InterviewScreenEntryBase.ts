/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ResponseType } from './ResponseType';

/**
 * Any models that are returned in our REST API should extend this class.
 * This class handles any snake_case to camelCase conversions.
 */
export type InterviewScreenEntryBase = {
  order: number;
  id?: string;
  name: string;
  prompt: string;
  responseKey: string;
  responseType: ResponseType;
  screenId: string;
  text: string;
};

