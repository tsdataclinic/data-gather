import {
  useMutation,
  useQueryClient,
  type UseMutateFunction,
} from '@tanstack/react-query';
import useInterviewStore from './useInterviewStore';
import type { InterviewServiceAPI } from '../services/InterviewService/InterviewServiceAPI';

/**
 * This hook should be used to execute any API calls that need to mutate the
 * server-side interview state. This hook wraps react-query's `useMutation`
 * hook to make it easy to call an InterviewService API function and then
 * invalidate any necessary queries that react-query might need to refetch.
 *
 * Usage:
 *   const updateInterview = useInterviewMutation({
 *     mutation: (interview, api) =>
 *       api.interviewAPI.updateInterview(interview),
 *     invalidateQuery: ['interview', interview.id]
 *   });
 *
 *   ...
 *   const onSave = () => updateInterview(interview);
 *
 * You can also pass an `onSuccess` and `onError` function to the mutation
 * function in case there's any post-mutation logic you need, like toast
 * messages.
 *   const onSave = () => updateInterview(interview, {
 *     onSuccess: () => toaster.notifySuccess('Success!', 'Interview saved'),
 *     onError: error => console.error(error),
 *   });
 */
export default function useInterviewMutation<
  TVariables = unknown,
  TResponse = unknown,
>(options: {
  invalidateQueries?: unknown[][];
  invalidateQuery?: unknown[];
  mutation: (data: TVariables, api: InterviewServiceAPI) => Promise<TResponse>;
}): UseMutateFunction<TResponse, unknown, TVariables> {
  const api = useInterviewStore();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: TVariables) => options.mutation(data, api),
    onSuccess: () => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries(queryKey);
        });
      } else if (options?.invalidateQuery) {
        queryClient.invalidateQueries(options.invalidateQuery);
      }
    },
  });

  return mutation.mutate;
}

export type { InterviewServiceAPI };
