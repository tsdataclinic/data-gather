import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import useAppDispatch from '../../hooks/useAppDispatch';
import useInterviewStore from '../../hooks/useInterviewStore';

/**
 * This hook loads all interviews and returns whether we are loading,
 * if there was an error, or if we loaded successfully.
 *
 * When interviews are loaded successfully it updates the global app
 * state by calling the app dispatch.
 */
export default function useLoadInitialInterviews(): {
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
} {
  const dispatch = useAppDispatch();
  const interviewStore = useInterviewStore();
  const {
    data: initialInterviews,
    isError,
    isLoading,
    isSuccess,
  } = useQuery(['allInterviews'], interviewStore.getAllInterviews);

  useEffect(() => {
    if (initialInterviews && isSuccess) {
      dispatch({
        interviews: initialInterviews,
        type: 'INTERVIEWS_UPDATE',
      });
    }
  }, [initialInterviews, isSuccess, dispatch]);

  return { isError, isLoading, isSuccess };
}
