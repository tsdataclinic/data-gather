import * as User from '../../models/User';
import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';

export interface InterviewServiceAPI {
  interviewAPI: {
    createInterview(interview: Interview.CreateT): Promise<Interview.T>;
    deleteInterview(interviewId: string): Promise<void>;
    getAllEntries(
      interviewId: string,
    ): Promise<InterviewScreenEntry.WithScreenT[]>;
    getAllInterviews(): Promise<Interview.T[]>;
    getInterview(interviewId: string): Promise<Interview.WithScreensAndActions>;
    getInterviewByVanityUrl(
      vanityUrl: string,
    ): Promise<Interview.WithScreensAndActions>;
    updateInterview(
      interviewId: string,
      interview: Interview.UpdateT,
    ): Promise<Interview.T>;
    updateInterviewStartingState(
      interviewId: string,
      startingScreenIds: readonly string[],
    ): Promise<Interview.WithScreensAndActions>;
  };

  interviewScreenAPI: {
    createInterviewScreen(
      screen: InterviewScreen.CreateT,
    ): Promise<InterviewScreen.T>;
    deleteInterviewScreen(screenId: string): Promise<void>;
    getInterviewScreen(
      screenId: string,
    ): Promise<InterviewScreen.WithChildrenT>;
    updateInterviewScreen(
      screenId: string,
      screen: InterviewScreen.UpdateT,
    ): Promise<InterviewScreen.WithChildrenT>;
  };

  userAPI: {
    getCurrentUser(): Promise<User.T>;
  };
}
