import * as React from 'react';
import * as Interview from '../../models/Interview';
import BackendInterviewService from './BackendInterviewService';
import LocalInterviewService from './LocalInterviewService';
import { InterviewServiceAPI } from './InterviewServiceAPI';

export class InterviewServiceImpl implements InterviewServiceAPI {
  localStore: LocalInterviewService;

  backendStore: BackendInterviewService;

  // TODO: don't hardcode this
  isAuthenticated = true;

  constructor() {
    this.localStore = new LocalInterviewService();
    this.backendStore = new BackendInterviewService();
  }

  createInterview = (
    name: string,
    description: string,
  ): Promise<Interview.T> => {
    if (this.isAuthenticated) {
      return this.backendStore.createInterview(name, description);
    }
    return this.localStore.createInterview(name, description);
  };

  getAllInterviews = async (): Promise<Interview.T[]> => {
    if (this.isAuthenticated) {
      return this.backendStore.getAllInterviews();
    }
    return this.localStore.getAllInterviews();
  };
}

const InterviewServiceContext = React.createContext<
  InterviewServiceImpl | undefined
>(undefined);

const InterviewService = {
  API: InterviewServiceImpl,
  Context: InterviewServiceContext,
  Provider: InterviewServiceContext.Provider,
};

export default InterviewService;
