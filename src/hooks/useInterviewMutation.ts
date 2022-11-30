import {
  useMutation,
  useQueryClient,
  type UseMutateFunction,
} from '@tanstack/react-query';
import useInterviewStore from './useInterviewStore';
import type { InterviewServiceAPI } from '../services/InterviewService/InterviewServiceAPI';

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
