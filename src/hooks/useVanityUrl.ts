import { useQuery } from '@tanstack/react-query';
import * as Interview from '../models/Interview';
import useInterviewService from './useInterviewService';

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
): Interview.WithScreensAndActions | undefined {
  const interviewService = useInterviewService();

  // load interview from backend
  const { data: interview } = useQuery({
    queryKey: ['vanityUrl', vanityUrl],
    queryFn: () =>
      vanityUrl
        ? interviewService.interviewAPI.getInterviewByVanityUrl(vanityUrl)
        : undefined,
  });

  return interview;
}
