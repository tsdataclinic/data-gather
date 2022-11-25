import * as React from 'react';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
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

  getStore(): InterviewServiceAPI {
    return this.isAuthenticated ? this.backendStore : this.localStore;
  }

  InterviewAPI = {
    createInterview: (interview: Interview.T): Promise<Interview.T> =>
      this.getStore().InterviewAPI.createInterview(interview),

    getAllInterviews: (): Promise<Interview.T[]> =>
      this.getStore().InterviewAPI.getAllInterviews(),

    getInterview: (interviewId: string): Promise<Interview.T> =>
      this.getStore().InterviewAPI.getInterview(interviewId),

    updateInterview: (
      interviewId: string,
      interview: Interview.T,
    ): Promise<Interview.T> =>
      this.getStore().InterviewAPI.updateInterview(interviewId, interview),
  };

  InterviewScreenAPI = {
    createInterviewScreen: (
      screen: InterviewScreen.T,
    ): Promise<InterviewScreen.T> =>
      this.getStore().InterviewScreenAPI.createInterviewScreen(screen),

    getInterviewScreen: (screenId: string): Promise<InterviewScreen.T> =>
      this.getStore().InterviewScreenAPI.getInterviewScreen(screenId),

    updateInterviewScreen: (
      screenId: string,
      screen: InterviewScreen.T,
    ): Promise<InterviewScreen.T> =>
      this.getStore().InterviewScreenAPI.updateInterviewScreen(
        screenId,
        screen,
      ),
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
