/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ResponseType } from './ResponseType';
import type { SerializedInterviewScreenRead } from './SerializedInterviewScreenRead';

/**
 * InterviewScreenEntry with a back pointer to the Screen it belongs to.
 */
export type SerializedInterviewScreenEntryReadWithScreen = {
  order: number;
  name: string;
  prompt: Record<string, string>;
  required?: boolean;
  responseKey: string;
  responseType: ResponseType;
  responseTypeOptions: any;
  screenId: string;
  text: Record<string, string>;
  id: string;
  screen: SerializedInterviewScreenRead;
};

