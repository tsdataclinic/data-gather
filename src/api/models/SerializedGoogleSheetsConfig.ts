/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedGoogleSheetsAuthConfig } from './SerializedGoogleSheetsAuthConfig';
import type { SerializedGoogleSheetsSpreadsheet } from './SerializedGoogleSheetsSpreadsheet';

/**
 * Contains authentication configurations and the data store schema.
 */
export type SerializedGoogleSheetsConfig = {
  type: 'google_sheets';
  authSettings: SerializedGoogleSheetsAuthConfig;
  spreadsheets?: Array<SerializedGoogleSheetsSpreadsheet>;
};

