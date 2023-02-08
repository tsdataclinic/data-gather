/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedAirtableTable } from './SerializedAirtableTable';

export type SerializedAirtableSettings = {
  accessToken: string;
  baseId?: string;
  tables?: Array<SerializedAirtableTable>;
};

