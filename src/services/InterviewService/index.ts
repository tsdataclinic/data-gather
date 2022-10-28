import * as React from 'react';
import * as Interview from '../../models/Interview';
import ServerInterviewService from './ServerInterviewService';
import LocalInterviewService from './LocalInterviewService';
import { InterviewServiceAPI } from './InterviewServiceAPI';

export class InterviewServiceImpl implements InterviewServiceAPI {
  localStore: LocalInterviewService;

  serverStore: ServerInterviewService;

  // TODO: don't hardcode this
  isAuthenticated = false;

  constructor() {
    this.localStore = new LocalInterviewService();
    this.serverStore = new ServerInterviewService();
  }

  createInterview = (
    name: string,
    description: string,
  ): Promise<Interview.T> => {
    if (this.isAuthenticated) {
      return this.serverStore.createInterview(name, description);
    }
    return this.localStore.createInterview(name, description);
  };

  getAllInterviews = async (): Promise<Interview.T[]> => {
    if (this.isAuthenticated) {
      return this.serverStore.getAllInterviews();
    }

    const response = await fetch('/api/hello', { method: 'GET' });
    const data = await response.json();
    console.log('data', data);

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
