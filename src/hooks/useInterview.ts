import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import * as Interview from '../models/Interview';
import useAppDispatch from './useAppDispatch';
import useAppState from './useAppState';
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
  const dispatch = useAppDispatch();
  const interviewStore = useInterviewStore();
  const { loadedInterviews } = useAppState();
  const interviewFromStorage = useLiveQuery(
    () => interviewStore.getInterview(id),
    [id],
  );

  // if the interviewFromStorage has changed then we should update it in
  // our global state
  useEffect(() => {
    if (interviewFromStorage) {
      dispatch({
        interview: interviewFromStorage,
        type: 'INTERVIEW_UPDATE',
      });
    }
  }, [interviewFromStorage, dispatch]);

  // load the interview from global state (which should be up-to-date with
  // whatever is in storage)
  return loadedInterviews.get(id);
}
