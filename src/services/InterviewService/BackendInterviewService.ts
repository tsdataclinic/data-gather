import * as User from '../../models/User';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import { InterviewServiceAPI } from './InterviewServiceAPI';
import { FastAPIService } from '../../api/FastAPIService';
import getAuthToken from '../../auth/getAuthToken';

export default class BackendInterviewService implements InterviewServiceAPI {
  private api = new FastAPIService({
    TOKEN: async () => (await getAuthToken()) ?? 'not_found',
  });

  userAPI = {
    getCurrentUser: async (): Promise<User.T> => {
      const serializedUser = await this.api.users.getSelfUser();
      return User.deserialize(serializedUser);
    },
  };

  interviewAPI = {
    createInterview: async (
      interview: Interview.CreateT,
    ): Promise<Interview.T> => {
      const serializedInterview = await this.api.interviews.createInterview(
        interview,
      );
      return Interview.deserialize(serializedInterview);
    },

    getAllEntries: async (
      interviewId: string,
    ): Promise<InterviewScreenEntry.WithScreenT[]> => {
      const serializedEntries = await this.api.interviews.getInterviewEntries(
        interviewId,
      );
      return serializedEntries.map(InterviewScreenEntry.deserializeWithScreen);
    },

    getAllInterviews: async (): Promise<Interview.T[]> => {
      const serializedInterviews = await this.api.interviews.getInterviews();
      return serializedInterviews.map(Interview.deserialize);
    },

    getInterview: async (
      interviewId: string,
    ): Promise<Interview.WithScreensAndActions> => {
      const serializedInterview = await this.api.interviews.getInterview(
        interviewId,
      );
      return Interview.deserialize(serializedInterview);
    },

    getInterviewByVanityUrl: async (
      vanityUrl: string,
    ): Promise<Interview.WithScreensAndActions> => {
      const serializedInterview =
        await this.api.interviews.getInterviewByVanityUrl(vanityUrl);
      return Interview.deserialize(serializedInterview);
    },

    updateInterview: async (
      interviewId: string,
      interview: Interview.UpdateT,
    ): Promise<Interview.T> => {
      const serializedInterview = await this.api.interviews.updateInterview(
        interviewId,
        Interview.serialize(interview),
      );
      return Interview.deserialize(serializedInterview);
    },

    updateInterviewStartingState: async (
      interviewId: string,
      startingScreenIds: readonly string[],
    ): Promise<Interview.WithScreensAndActions> => {
      const serializedInterview =
        await this.api.interviews.updateInterviewStartingState(
          interviewId,
          startingScreenIds as string[],
        );
      return Interview.deserialize(serializedInterview);
    },
  };

  interviewScreenAPI = {
    createInterviewScreen: async (
      screen: InterviewScreen.CreateT,
    ): Promise<InterviewScreen.T> => {
      const serializedScreen =
        await this.api.interviewScreens.createInterviewScreen(
          InterviewScreen.serialize(screen),
        );
      return InterviewScreen.deserialize(serializedScreen);
    },

    deleteInterviewScreen: async (screenId: string): Promise<void> =>
      this.api.interviewScreens.deleteInterviewScreen(screenId),

    getInterviewScreen: async (
      screenId: string,
    ): Promise<InterviewScreen.WithChildrenT> => {
      const serializedScreen =
        await this.api.interviewScreens.getInterviewScreen(screenId);
      return InterviewScreen.deserialize(serializedScreen);
    },

    updateInterviewScreen: async (
      screenId: string,
      screen: InterviewScreen.UpdateT,
    ): Promise<InterviewScreen.WithChildrenT> => {
      const serializedScreen =
        await this.api.interviewScreens.updateInterviewScreen(
          screenId,
          InterviewScreen.serialize(screen),
        );
      return InterviewScreen.deserialize(serializedScreen);
    },
  };
}
