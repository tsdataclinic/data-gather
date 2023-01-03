import * as React from 'react';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
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

  interviewAPI = {
    createInterview: (interview: Interview.CreateT): Promise<Interview.T> =>
      this.getStore().interviewAPI.createInterview(interview),

    getAllInterviews: (): Promise<Interview.T[]> =>
      this.getStore().interviewAPI.getAllInterviews(),

    getAllEntries: (
      interviewId: string,
    ): Promise<InterviewScreenEntry.WithScreenT[]> =>
      this.getStore().interviewAPI.getAllEntries(interviewId),

    getInterview: (interviewId: string): Promise<Interview.WithScreensT> =>
      this.getStore().interviewAPI.getInterview(interviewId),

    getInterviewByVanityUrl: (
      vanityUrl: string,
    ): Promise<Interview.WithScreensT> =>
      // loading by vanity URL should always use the real backend
      this.backendStore.interviewAPI.getInterviewByVanityUrl(vanityUrl),

    updateInterview: (
      interviewId: string,
      interview: Interview.UpdateT,
    ): Promise<Interview.T> =>
      this.getStore().interviewAPI.updateInterview(interviewId, interview),

    updateInterviewStartingState: (
      interviewId: string,
      startingScreenIds: readonly string[],
    ): Promise<Interview.WithScreensT> =>
      this.getStore().interviewAPI.updateInterviewStartingState(
        interviewId,
        startingScreenIds,
      ),
  };

  interviewScreenAPI = {
    createInterviewScreen: (
      screen: InterviewScreen.CreateT,
    ): Promise<InterviewScreen.T> =>
      this.getStore().interviewScreenAPI.createInterviewScreen(screen),

    deleteInterviewScreen: (screenId: string): Promise<void> =>
      this.getStore().interviewScreenAPI.deleteInterviewScreen(screenId),

    getInterviewScreen: (
      screenId: string,
    ): Promise<InterviewScreen.WithChildrenT> =>
      this.getStore().interviewScreenAPI.getInterviewScreen(screenId),

    updateInterviewScreen: (
      screenId: string,
      screen: InterviewScreen.UpdateT,
    ): Promise<InterviewScreen.WithChildrenT> =>
      this.getStore().interviewScreenAPI.updateInterviewScreen(
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
