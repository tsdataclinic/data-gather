import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import * as InterviewScreen from '../models/InterviewScreen';
import isNonNullable from '../util/isNonNullable';
import useAppDispatch from './useAppDispatch';
import useAppState from './useAppState';
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

  // load interview screens from backend
  const { data: screensFromStorage } = useQuery({
    queryKey: ['interviewScreens', interviewId],
    queryFn: async () => {
      if (interviewId === undefined) {
        return undefined;
      }
      const interview = await interviewStore.InterviewAPI.getInterview(
        interviewId,
      );
      return interview.screens;
    },
  });

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
      screensFromStorage
        ? screensFromStorage
            .map(screen => loadedInterviewScreens.get(screen.id))
            .filter(isNonNullable)
        : undefined,
    [screensFromStorage, loadedInterviewScreens],
  );

  return interviewId === undefined ? undefined : screens;
}
