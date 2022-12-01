/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The Interview model as a database table.
 */
export type SerializedInterview = {
  description: string;
  name: string;
  notes: string;
  vanityUrl?: string;
  published: boolean;
  id?: string;
  createdDate?: string;
};

