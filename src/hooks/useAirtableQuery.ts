import { useQuery } from '@tanstack/react-query';
import { ResponseTypeOptions } from '../models/InterviewScreenEntry';
import getEnvConfig, { EnvVar } from '../util/getEnvConfig';

/**
 * Hook to access Airtable Records API
 */
// TODO - add support for other API functions
export default function useAirtableQuery(
  queryString: string,
  queryOptions: ResponseTypeOptions,
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
    queryKey: ['airtableQuery', queryString],
    queryFn: async () => {
      // fetch all based on Base and Table
      if (queryString) {
        // TODO - enable searching on multiple fields, not just first one
        const airtableQueryURL = encodeURI(
          `${getEnvConfig(EnvVar.APIBaseURL) ?? '//'}/airtable-records/${
            queryOptions.selectedTable
          }?${queryOptions.selectedFields[0]}=${queryString}`,
        );
        const res = await fetch(airtableQueryURL);
        return res.json();
      }
      return [];
    },
  });

  return { isError, isLoading, isSuccess, responseData };
}
