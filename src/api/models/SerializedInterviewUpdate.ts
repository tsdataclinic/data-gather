/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The Interview model used on update requests.
 */
export type SerializedInterviewUpdate = {
  description: string;
  name: string;
  notes: string;
  vanityUrl?: string;
  published: boolean;
  ownerId: string;
  id: string;
  createdDate: string;
};

