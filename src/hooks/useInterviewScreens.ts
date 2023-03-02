import { useQuery } from '@tanstack/react-query';
import * as InterviewScreen from '../models/InterviewScreen';
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
  const interviewService = useInterviewService();

  // load interview screens from backend
  const { data: screensFromStorage } = useQuery({
    enabled: !!interviewId,
    queryKey: InterviewScreen.QueryKeys.getScreens(interviewId),
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

  return screensFromStorage;
}
