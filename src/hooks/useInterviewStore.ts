import invariant from 'invariant';
import { useContext } from 'react';
import InterviewStore from '../services/InterviewService';
import type { InterviewServiceAPI } from '../services/InterviewService/InterviewServiceAPI';

export default function useInterviewStore(): InterviewServiceAPI {
  const interviewStoreClient = useContext(InterviewStore.Context);
  invariant(
    interviewStoreClient,
    'Could not find an instance of InterviewStoreAPI.',
  );

  return interviewStoreClient;
}
