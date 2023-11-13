/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DataStoreType } from './DataStoreType';
import type { SerializedAirtableConfig } from './SerializedAirtableConfig';
import type { SerializedGoogleSheetsConfig } from './SerializedGoogleSheetsConfig';

/**
 * The DataStoreSetting model used when creating a new model.
 * `id` is optional because it is set by the database.
 */
export type SerializedDataStoreSettingCreate = {
  type: DataStoreType;
  config: (SerializedAirtableConfig | SerializedGoogleSheetsConfig);
  interviewId: string;
  id?: string;
};

