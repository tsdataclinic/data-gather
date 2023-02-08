/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ResponseType } from './ResponseType';
import type { SerializedAirtableOptions } from './SerializedAirtableOptions';
import type { SerializedInterviewScreenRead } from './SerializedInterviewScreenRead';
import type { SerializedSingleSelectOptions } from './SerializedSingleSelectOptions';

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
  responseTypeOptions?: (SerializedAirtableOptions | SerializedSingleSelectOptions);
  screenId: string;
  text: Record<string, string>;
  id: string;
  screen: SerializedInterviewScreenRead;
};

