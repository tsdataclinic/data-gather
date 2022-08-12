import { useLiveQuery } from 'dexie-react-hooks';
import * as Interview from '../models/Interview';
import useInterviewStore from './useInterviewStore';

/**
 * Fetch an interview given an interview id.
 *
 * @param {string} id The id to query for
 *
 * @returns {Interview.T | undefined} The interview, or undefined if the
 * interview couldn't be found.
 */
export default function useInterview(id: string): Interview.T | undefined {
  const interviewStore = useInterviewStore();
  return useLiveQuery(() => interviewStore.getInterview(id), [id]);
}
