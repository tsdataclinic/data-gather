/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedAirtableList } from './SerializedAirtableList';

export type SerializedAirtableTable = {
  id: string;
  name: string;
  description?: string;
  fields: Array<SerializedAirtableList>;
};

