/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedAirtableAuthConfig } from './SerializedAirtableAuthConfig';
import type { SerializedAirtableBase } from './SerializedAirtableBase';

/**
 * Contains authentication configurations and the data store schema.
 */
export type SerializedAirtableConfig = {
  type: 'airtable';
  apiKey?: string;
  authSettings: SerializedAirtableAuthConfig;
  bases?: Array<SerializedAirtableBase>;
};

