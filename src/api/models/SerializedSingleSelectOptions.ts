/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SerializedAirtableOptions } from './SerializedAirtableOptions';
import type { SerializedSelectableOption } from './SerializedSelectableOption';

export type SerializedSingleSelectOptions = {
  options: Array<SerializedSelectableOption>;
  airtableConfig?: SerializedAirtableOptions;
};

