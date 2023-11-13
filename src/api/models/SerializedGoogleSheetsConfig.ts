/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedGoogleSheetsAuthConfig } from './SerializedGoogleSheetsAuthConfig';

/**
 * Contains authentication configurations and the data store schema.
 */
export type SerializedGoogleSheetsConfig = {
  type: 'google_sheets';
  authSettings: SerializedGoogleSheetsAuthConfig;
  workbooks?: Array<string>;
};

