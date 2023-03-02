/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedAirtableBase } from './SerializedAirtableBase';

export type SerializedAirtableSettings = {
  apiKey: string;
  bases?: Array<SerializedAirtableBase>;
};

