import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';

export interface InterviewServiceAPI {
  InterviewAPI: {
    createInterview(interview: Interview.CreateT): Promise<Interview.T>;
    getAllInterviews(): Promise<Interview.T[]>;
    getInterview(interviewId: string): Promise<Interview.WithScreensT>;
    updateInterview(
      interviewId: string,
      interview: Interview.UpdateT,
    ): Promise<Interview.T>;
    updateInterviewStartingState(
      interviewId: string,
      startingScreenIds: readonly string[],
    ): Promise<Interview.WithScreensT>;
  };

  InterviewScreenAPI: {
    createInterviewScreen(
      screen: InterviewScreen.CreateT,
    ): Promise<InterviewScreen.T>;
    getInterviewScreen(
      screenId: string,
    ): Promise<InterviewScreen.WithChildrenT>;
    updateInterviewScreen(
      screenId: string,
      screen: InterviewScreen.UpdateT,
    ): Promise<InterviewScreen.WithChildrenT>;
  };
}
