import * as React from 'react';
import { useIsAuthenticated as useAzureIsAuthenticated } from '@azure/msal-react';
import jwtDecode from 'jwt-decode';
import isFakeAuthEnabled from './isFakeAuthEnabled';

/**
 * A hook which tells us if the user is authenticated.
 * @returns boolean
 */
export default function useIsAuthenticated(): boolean {
  const isAzureAuthenticated = useAzureIsAuthenticated();
  const fakeAuthToken = window.localStorage.getItem('token');

  const isFakeAuthenticated = React.useMemo(() => {
    if (fakeAuthToken) {
      const decodedToken = jwtDecode<{ exp: number }>(fakeAuthToken);
      const now = new Date();

      // returns true if token hasn't expired yet
      return decodedToken.exp * 1000 > now.getTime();
    }
    return false;
  }, [fakeAuthToken]);

  return isFakeAuthEnabled() ? isFakeAuthenticated : isAzureAuthenticated;
}
