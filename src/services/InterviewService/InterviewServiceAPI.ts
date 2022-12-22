import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';

export interface InterviewServiceAPI {
  interviewAPI: {
    createInterview(interview: Interview.CreateT): Promise<Interview.T>;
    getAllInterviews(): Promise<Interview.T[]>;
    getInterview(interviewId: string): Promise<Interview.WithScreensT>;
    getInterviewByVanityUrl(vanityUrl: string): Promise<Interview.WithScreensT>;
    updateInterview(
      interviewId: string,
      interview: Interview.UpdateT,
    ): Promise<Interview.T>;
    updateInterviewStartingState(
      interviewId: string,
      startingScreenIds: readonly string[],
    ): Promise<Interview.WithScreensT>;
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
}
