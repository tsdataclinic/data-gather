import invariant from 'invariant';
import { useContext } from 'react';
import InterviewService from '../services/InterviewService';
import type { InterviewServiceAPI } from '../services/InterviewService/InterviewServiceAPI';

export default function useInterviewService(): InterviewServiceAPI {
  const interviewService = useContext(InterviewService.Context);
  invariant(
    interviewService,
    'Could not find an instance of InterviewStoreAPI.',
  );

  return interviewService;
}
