import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo } from 'react';
import * as InterviewScreen from '../models/InterviewScreen';
import isNonNullable from '../util/isNonNullable';
import useAppDispatch from './useAppDispatch';
import useAppState from './useAppState';
import useInterview from './useInterview';
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
  interviewId: string | undefined,
): InterviewScreen.T[] | undefined {
  const dispatch = useAppDispatch();
  const interviewStore = useInterviewStore();
  const { loadedInterviewScreens } = useAppState();
  const interview = useInterview(interviewId);

  // load interview screens from backend
  const screensFromStorage = useLiveQuery(
    () =>
      interviewId === undefined
        ? undefined
        : interviewStore.getScreensOfInterview(interviewId),
    [interviewId],
  );

  // if the screensFromStorage has changed then we should update it in
  // our global state
  useEffect(() => {
    if (screensFromStorage) {
      dispatch({
        screens: screensFromStorage,
        type: 'SCREENS_UPDATE',
      });
    }
  }, [screensFromStorage, dispatch]);

  const screens = useMemo(
    () =>
      interview?.screens
        .map(screenId => loadedInterviewScreens.get(screenId))
        .filter(isNonNullable),
    [interview, loadedInterviewScreens],
  );

  return interviewId === undefined ? undefined : screens;
}
