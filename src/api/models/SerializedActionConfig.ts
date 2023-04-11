/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActionType } from './ActionType';

export type SerializedActionConfig = {
  payload?: string;
  type: ActionType;
  id: string;
};

