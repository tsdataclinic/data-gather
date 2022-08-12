import { useLiveQuery } from 'dexie-react-hooks';
import * as InterviewScreen from '../models/InterviewScreen';
import useInterviewStore from './useInterviewStore';

/**
 * Fetch all interview screens linked to a given interview.
 *
 * @param {string} interviewId The interview id to look up
 *
 * @returns {InterviewScreen.T[] | undefined} Array of interview screens, or
 * undefined if the interview could not be found.
 */
export default function useInterviewScreens(
  interviewId: string,
): InterviewScreen.T[] | undefined {
  const interviewStore = useInterviewStore();
  return useLiveQuery(
    () => interviewStore.getScreensOfInterview(interviewId),
    [interviewId],
  );
}
