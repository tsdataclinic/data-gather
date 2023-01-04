import { useQuery } from '@tanstack/react-query';
import useInterviewService from '../hooks/useInterviewService';

/**
 * A hook which returns information about the current user.
 */
export default function useCurrentUser(): {
  error: unknown;
  isLoading: boolean;
  user: { id: string } | undefined;
} {
  const interviewService = useInterviewService();
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['user'],
    queryFn: interviewService.userAPI.getCurrentUser,
  });

  return {
    error,
    isLoading,
    user: userData,
  };
}
