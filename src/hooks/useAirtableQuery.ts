import { useQuery } from '@tanstack/react-query';
import * as InterviewScreenEntry from '../models/InterviewScreenEntry';

// TODO - add support for other API functions
/**
 * Hook to access Airtable Records API
 */
export default function useAirtableQuery(
  queryString: string,
  interviewId: string | undefined,
  queryOptions: InterviewScreenEntry.AirtableOptions | undefined,
): {
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  responseData: any;
} {
  const {
    data: responseData,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    enabled: !!queryOptions,
    queryKey: ['airtableQuery', queryString],
    queryFn: async () => {
      // fetch all based on Base and Table
      if (queryString && interviewId && queryOptions) {
        const { selectedFields, selectedTable } = queryOptions;
        const searchParams = new URLSearchParams();
        selectedFields.forEach(field => {
          searchParams.append(field, queryString);
        });

        // TODO: replace this with a function call using the API service class
        const res = await fetch(
          `/api/airtable-records/${interviewId}/${selectedTable}?${searchParams.toString()}`,
        );
        return res.json();
      }
      return [];
    },
  });

  return { isError, isLoading, isSuccess, responseData };
}
