/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DataStoreType } from './DataStoreType';
import type { SerializedAirtableConfig } from './SerializedAirtableConfig';
import type { SerializedGoogleSheetsConfig } from './SerializedGoogleSheetsConfig';

/**
 * The DataStoreSetting model used in HTTP responses when reading
 * from the database. Any API functions that return a DataStoreSetting
 * should respond with a DataStoreSettingRead model or one of its
 * subclasses.
 *
 * `id` is not optional because it must exist already if it's in the database.
 */
export type SerializedDataStoreSettingRead = {
  type: DataStoreType;
  config: (SerializedAirtableConfig | SerializedGoogleSheetsConfig);
  interviewId: string;
  id: string;
};

