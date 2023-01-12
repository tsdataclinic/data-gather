import * as InterviewScreenEntry from '../models/InterviewScreenEntry';

/**
 * Represents the response to a single InterviewScreenEntry.
 * This could be a single string or an object mapping strings to any type.
 * The object representation is used in Entries that perform lookups, so their
 * response's might contain an entire record of data.
 */
export type SingleResponse = string | Record<string, unknown>;

/**
 * An object storing the response data for an entire interview.
 */
export type ResponseData = {
  [responseKey: string]: {
    entry: InterviewScreenEntry.T;
    response: string | Record<string, unknown>;
  };
};
