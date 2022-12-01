import * as React from 'react';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import BackendInterviewService from './BackendInterviewService';
import LocalInterviewService from './LocalInterviewService';
import { InterviewServiceAPI } from './InterviewServiceAPI';
import useCurrentUser from '../../auth/useCurrentUser';

export class InterviewServiceImpl implements InterviewServiceAPI {
  localStore: LocalInterviewService;

  backendStore: BackendInterviewService;

  // TODO: don't hardcode this
  isAuthenticated = false;

  constructor() {
    this.localStore = new LocalInterviewService();
    this.backendStore = new BackendInterviewService();
  }

  setAuthenticationStatus(isAuthenticated: boolean): void {
    this.isAuthenticated = isAuthenticated;
  }

  getStore(): InterviewServiceAPI {
    return this.isAuthenticated ? this.backendStore : this.localStore;
  }

  InterviewAPI = {
    createInterview: (interview: Interview.CreateT): Promise<Interview.T> =>
      this.getStore().InterviewAPI.createInterview(interview),

    getAllInterviews: (): Promise<Interview.T[]> =>
      this.getStore().InterviewAPI.getAllInterviews(),

    getInterview: (interviewId: string): Promise<Interview.WithScreensT> =>
      this.getStore().InterviewAPI.getInterview(interviewId),

    updateInterview: (
      interviewId: string,
      interview: Interview.UpdateT,
    ): Promise<Interview.T> =>
      this.getStore().InterviewAPI.updateInterview(interviewId, interview),

    updateInterviewStartingState: (
      interviewId: string,
      startingScreenIds: readonly string[],
    ): Promise<Interview.WithScreensT> =>
      this.getStore().InterviewAPI.updateInterviewStartingState(
        interviewId,
        startingScreenIds,
      ),
  };

  InterviewScreenAPI = {
    createInterviewScreen: (
      screen: InterviewScreen.CreateT,
    ): Promise<InterviewScreen.T> =>
      this.getStore().InterviewScreenAPI.createInterviewScreen(screen),

    getInterviewScreen: (
      screenId: string,
    ): Promise<InterviewScreen.WithChildrenT> =>
      this.getStore().InterviewScreenAPI.getInterviewScreen(screenId),

    updateInterviewScreen: (
      screenId: string,
      screen: InterviewScreen.UpdateT,
    ): Promise<InterviewScreen.WithChildrenT> =>
      this.getStore().InterviewScreenAPI.updateInterviewScreen(
        screenId,
        screen,
      ),
  };
}

const InterviewServiceContext = React.createContext<
  InterviewServiceImpl | undefined
>(undefined);

type InterviewServiceProviderProps = {
  children: React.ReactNode;
  client: InterviewServiceImpl;
};

function InterviewServiceProvider({
  client,
  children,
}: InterviewServiceProviderProps): JSX.Element {
  const { isAuthenticated } = useCurrentUser();
  client.setAuthenticationStatus(isAuthenticated);

  return (
    <InterviewServiceContext.Provider value={client}>
      {children}
    </InterviewServiceContext.Provider>
  );
}

const InterviewService = {
  API: InterviewServiceImpl,
  Context: InterviewServiceContext,
  Provider: InterviewServiceProvider,
};

export default InterviewService;