/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ResponseType } from './ResponseType';
import type { SerializedInterviewScreen } from './SerializedInterviewScreen';

/**
 * InterviewScreenEntry with a back pointer to the Screen it belongs to.
 */
export type SerializedInterviewScreenEntryReadWithScreen = {
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
  screen: SerializedInterviewScreen;
};

