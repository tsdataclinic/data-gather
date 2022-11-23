/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InterviewScreenBase } from './InterviewScreenBase';

/**
 * Any models that are returned in our REST API should extend this class.
 * This class handles any snake_case to camelCase conversions.
 */
export type InterviewWithScreens = {
  screens: Array<InterviewScreenBase>;
  createdDate: string;
  description: string;
  id: string;
  name: string;
  notes: string;
};

