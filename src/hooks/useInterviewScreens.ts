import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as InterviewScreen from '../models/InterviewScreen';
import useAppDispatch from './useAppDispatch';
import useInterviewService from './useInterviewService';

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
): InterviewScreen.WithChildrenT[] | undefined {
  const dispatch = useAppDispatch();
  const interviewService = useInterviewService();

  // load interview screens from backend
  const { data: screensFromStorage } = useQuery({
    enabled: !!interviewId,
    queryKey: ['interviewScreens', interviewId],
    queryFn: async () => {
      if (interviewId === undefined) {
        return undefined;
      }
      const interview = await interviewService.interviewAPI.getInterview(
        interviewId,
      );
      return Promise.all(
        interview.screens.map(screen =>
          interviewService.interviewScreenAPI.getInterviewScreen(screen.id),
        ),
      );
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

  return screensFromStorage;
}
