import invariant from 'invariant';
import { useContext } from 'react';
import InterviewStore from '../store/InterviewStore';
import type { InterviewStoreAPI } from '../store/InterviewStore';

export default function useInterviewStore(): InterviewStoreAPI {
  const interviewStoreClient = useContext(InterviewStore.Context);
  invariant(
    interviewStoreClient,
    'Could not find an instance of InterviewStoreAPI.',
  );

  return interviewStoreClient;
}
