import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import queryString from 'query-string';
import { useMutation } from '@tanstack/react-query';
import * as Interview from '../../models/Interview';

export default function GoogleSheetsAuth(): JSX.Element {
  const navigate = useNavigate();
  const { mutate: authenticate } = useMutation({
    mutationFn: async (
      authData: queryString.ParsedQuery<string>,
    ): Promise<Interview.T | undefined> => {
      const response = await fetch('/api/google-sheets-oauth-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });
      if (!response.ok) {
        return undefined;
      }
      const serializedInterview = await response.json();
      return Interview.deserialize(serializedInterview);
    },
  });

  // send the request
  React.useEffect(() => {
    // Extract the access token and other data from the URL
    const { state, ...parsedHash } = queryString.parse(window.location.hash);
    authenticate(
      { ...parsedHash, interview_id: state },
      {
        onSuccess: (interview: Interview.T | undefined) => {
          if (interview) {
            navigate(Interview.getConfigurePageURL(interview.id));
          }
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <p>Authenticating...</p>;
}
