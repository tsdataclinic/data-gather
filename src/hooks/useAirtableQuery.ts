import { useQuery } from '@tanstack/react-query';
import * as InterviewScreenEntry from '../models/InterviewScreenEntry';

/**
 * Hook to access Airtable Records API
 */
// TODO - add support for other API functions
export default function useAirtableQuery(
  queryString: string,
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
      if (queryString && queryOptions) {
        const { selectedFields, selectedTable } = queryOptions;
        const searchParams = new URLSearchParams();
        selectedFields.forEach(field => {
          searchParams.append(field, queryString);
        });

        // TODO: replace this with a function call using the API service class
        const res = await fetch(
          `/api/airtable-records/${selectedTable}?${searchParams.toString()}`,
        );
        return res.json();
      }
      return [];
    },
  });

  return { isError, isLoading, isSuccess, responseData };
}
