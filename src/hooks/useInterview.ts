import { useLiveQuery } from 'dexie-react-hooks';
import useInterviewStore from './useInterviewStore';
import type { InterviewRow } from '../store/InterviewStore';

/**
 * Fetch an interview from the InterviewStore given an interview id.
 *
 * @param {string} id The id to query for
 *
 * @returns {InterviewRow | undefined} The serialized InterviewRow or undefined
 * if no interview was found.
 */
export default function useInterview(id: string): InterviewRow | undefined {
  const interviewStore = useInterviewStore();
  return useLiveQuery(() => interviewStore.interviews?.get(id), [id]);
}
