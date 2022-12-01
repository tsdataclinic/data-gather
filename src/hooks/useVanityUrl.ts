import { useQuery } from '@tanstack/react-query';
import * as Interview from '../models/Interview';
import useInterviewStore from './useInterviewStore';

/**
 * Fetch an interview given an vanity url.
 *
 * @param {string} vanityUrl The vanity url to query for
 *
 * @returns {Interview.T | undefined} The interview, or undefined if the
 * interview couldn't be found.
 */
export default function useVanityUrl(
  vanityUrl: string | undefined,
): Interview.WithScreensT | undefined {
  const interviewStore = useInterviewStore();

  // load interview from backend
  const { data: interviewFromStorage } = useQuery({
    queryKey: ['vanityUrl', vanityUrl],
    queryFn: () =>
      vanityUrl
        ? interviewStore.InterviewAPI.getInterviewByVanityUrl(vanityUrl)
        : undefined,
  });

  return interviewFromStorage;
}
