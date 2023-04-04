/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedAirtableAuthSettings } from './SerializedAirtableAuthSettings';
import type { SerializedAirtableBase } from './SerializedAirtableBase';

export type SerializedAirtableSettings = {
  apiKey?: string;
  authSettings?: SerializedAirtableAuthSettings;
  bases?: Array<SerializedAirtableBase>;
};

