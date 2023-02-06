/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedAirtableTable } from './SerializedAirtableTable';

export type SerializedAirtableSettings = {
  access_token: string;
  base_id?: string;
  tables?: Array<SerializedAirtableTable>;
};

