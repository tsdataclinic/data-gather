/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The Interview model used when creating a new model.
 * `id` and `created_date` are optional because these are set by the database.
 */
export type SerializedInterviewCreate = {
  description: string;
  name: string;
  notes: string;
  id?: string;
  createdDate?: string;
};

