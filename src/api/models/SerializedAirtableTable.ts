/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedAirtableField } from './SerializedAirtableField';

export type SerializedAirtableTable = {
  id: string;
  name?: string;
  description?: string;
  fields: Array<SerializedAirtableField>;
};

