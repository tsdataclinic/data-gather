import { useLiveQuery } from 'dexie-react-hooks';
import * as InterviewScreenEntry from '../models/InterviewScreenEntry';
import useInterviewStore from './useInterviewStore';

/**
 * Fetch all interview screen entries linked to a given interview.
 * An interview can have multiple screens, and each screen can have multiple
 * entries.
 *
 * @param {string} interviewId The interview id to look up
 *
 * @returns {Map<string, InterviewScreenEntry.T[]> | undefined} A Map mapping
 * a screen ID to an array of entries that correspond to that screen. Or undefined if
 * the interview could not be found.
 */
export default function useInterviewScreenEntries(
  interviewId: string,
): Map<string, InterviewScreenEntry.T[]> | undefined {
  const interviewStore = useInterviewStore();
  return useLiveQuery(
    () => interviewStore.getScreenEntriesOfInterview(interviewId),
    [interviewId],
  );
}
