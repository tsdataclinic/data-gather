import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type QueryClient,
} from '@tanstack/react-query';
import useInterviewService from './useInterviewService';
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
  TError = unknown,
  TContext = unknown,
>(options: {
  invalidateQueries?: unknown[][];
  invalidateQuery?: unknown[];
  mutation: (
    params: TVariables,
    api: InterviewServiceAPI,
  ) => Promise<TResponse>;
  onError?: (
    err: TError,
    params: TVariables,
    context: TContext | undefined,
    queryClient: QueryClient,
  ) => Promise<unknown> | unknown;
  onMutate?: (
    params: TVariables,
    queryClient: QueryClient,
  ) => Promise<TContext | undefined> | TContext | undefined;
}): UseMutationResult<TResponse, TError, TVariables, TContext> {
  const api = useInterviewService();
  const queryClient = useQueryClient();
  const mutationObj = useMutation({
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
    onMutate: (params: TVariables) =>
      options.onMutate ? options.onMutate(params, queryClient) : undefined,
    onError: (
      error: TError,
      params: TVariables,
      context: TContext | undefined,
    ) =>
      options.onError
        ? options.onError(error, params, context, queryClient)
        : undefined,
  });

  return mutationObj;
}

export type { InterviewServiceAPI };
