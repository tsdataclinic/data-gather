import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import { InterviewServiceAPI } from './InterviewServiceAPI';
import { FastAPIService } from '../../api/FastAPIService';

export default class BackendInterviewService implements InterviewServiceAPI {
  private api = new FastAPIService();

  InterviewAPI = {
    createInterview: async (interview: Interview.T): Promise<Interview.T> => {
      const serializedInterview = await this.api.interviews.createInterview(
        Interview.serialize(interview),
      );
      return Interview.deserialize(serializedInterview);
    },

    getAllInterviews: async (): Promise<Interview.T[]> => {
      const serializedInterviews = await this.api.interviews.getInterviews();
      return serializedInterviews.map(Interview.deserialize);
    },

    getInterview: async (interviewId: string): Promise<Interview.T> => {
      const serializedInterview = await this.api.interviews.getInterview(
        interviewId,
      );
      return Interview.deserialize(serializedInterview);
    },

    updateInterview: async (
      interviewId: string,
      interview: Interview.T,
    ): Promise<Interview.T> => {
      const serializedInterview = await this.api.interviews.updateInterview(
        interviewId,
        Interview.serialize(interview),
      );
      return Interview.deserialize(serializedInterview);
    },
  };

  InterviewScreenAPI = {
    createInterviewScreen: async (
      screen: InterviewScreen.T,
    ): Promise<InterviewScreen.T> => {
      const serializedScreen =
        await this.api.interviewScreens.createInterviewScreen(
          InterviewScreen.serialize(screen),
        );
      return InterviewScreen.deserialize(serializedScreen);
    },

    getInterviewScreen: async (
      screenId: string,
    ): Promise<InterviewScreen.T> => {
      const serializedScreen =
        await this.api.interviewScreens.getInterviewScreen(screenId);
      return InterviewScreen.deserialize(serializedScreen);
    },

    updateInterviewScreen: async (
      screenId: string,
      screen: InterviewScreen.T,
    ): Promise<InterviewScreen.T> => {
      const requestScreen = InterviewScreen.serialize(screen);
      const serializedScreen =
        await this.api.interviewScreens.updateInterviewScreen(screenId, {
          ...requestScreen,
          actions: requestScreen.actions ?? [],
          entries: requestScreen.entries ?? [],
        });
      return InterviewScreen.deserialize(serializedScreen);
    },
  };
}
