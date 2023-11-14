/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedGoogleSheetsWorksheet } from './SerializedGoogleSheetsWorksheet';

export type SerializedGoogleSheetsSpreadsheet = {
  title: string;
  id: string;
  worksheets: Array<SerializedGoogleSheetsWorksheet>;
};

