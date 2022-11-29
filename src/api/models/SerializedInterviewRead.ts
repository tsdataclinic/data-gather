/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The Interview model used as in HTTP responses when reading from the
 * database. Any API functions that return an Interview should respond
 * with an InterviewRead model or one of its subclasses.
 *
 * `id` and `created_date` are not optional because they must exist already
 * if they are in the database.
 */
export type SerializedInterviewRead = {
  description: string;
  name: string;
  notes: string;
  id: string;
  createdDate: string;
};

