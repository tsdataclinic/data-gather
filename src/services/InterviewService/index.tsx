import * as React from 'react';
import * as User from '../../models/User';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import BackendInterviewService from './BackendInterviewService';
import LocalInterviewService from './LocalInterviewService';
import { InterviewServiceAPI } from './InterviewServiceAPI';
import useIsAuthenticated from '../../auth/useIsAuthenticated';

export class InterviewServiceImpl implements InterviewServiceAPI {
  localStore: LocalInterviewService;

  backendStore: BackendInterviewService;

  isAuthenticated = false;

  constructor(
    options: { isAuthenticated: boolean } = { isAuthenticated: false },
  ) {
    this.localStore = new LocalInterviewService();
    this.backendStore = new BackendInterviewService();
    this.isAuthenticated = options.isAuthenticated;
  }

  // eslint-disable-next-line class-methods-use-this
  setAuthenticationStatus(isAuthenticated: boolean): InterviewServiceImpl {
    return new InterviewServiceImpl({ isAuthenticated });
  }

  getStore(): InterviewServiceAPI {
    return this.isAuthenticated ? this.backendStore : this.localStore;
  }

  userAPI = {
    getCurrentUser: (): Promise<User.T> =>
      this.getStore().userAPI.getCurrentUser(),
  };

  interviewAPI = {
    createInterview: (interview: Interview.CreateT): Promise<Interview.T> =>
      this.getStore().interviewAPI.createInterview(interview),

    deleteInterview: (interviewId: string): Promise<void> =>
      this.getStore().interviewAPI.deleteInterview(interviewId),

    getAllInterviews: (): Promise<Interview.T[]> =>
      this.getStore().interviewAPI.getAllInterviews(),

    getAllEntries: (
      interviewId: string,
    ): Promise<InterviewScreenEntry.WithScreenT[]> =>
      this.getStore().interviewAPI.getAllEntries(interviewId),

    getInterview: (
      interviewId: string,
    ): Promise<Interview.WithScreensAndActions> =>
      this.getStore().interviewAPI.getInterview(interviewId),

    getInterviewByVanityUrl: (
      vanityUrl: string,
    ): Promise<Interview.WithScreensAndActions> =>
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
    ): Promise<Interview.WithScreensAndActions> =>
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
  pretendUserIsAuthenticated?: boolean;
};

function InterviewServiceProvider({
  client,
  children,
  pretendUserIsAuthenticated = false,
}: InterviewServiceProviderProps): JSX.Element {
  const isAuthenticated = useIsAuthenticated();

  const clientWithAuthStatus = React.useMemo(
    () =>
      client.setAuthenticationStatus(
        pretendUserIsAuthenticated ? true : isAuthenticated,
      ),
    [isAuthenticated, client, pretendUserIsAuthenticated],
  );

  return (
    <InterviewServiceContext.Provider value={clientWithAuthStatus}>
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
