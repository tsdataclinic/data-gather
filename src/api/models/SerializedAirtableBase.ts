/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedAirtableTable } from './SerializedAirtableTable';

export type SerializedAirtableBase = {
  name?: string;
  id: string;
  tables?: Array<SerializedAirtableTable>;
};

