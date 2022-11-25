import * as Interview from '../../models/Interview';
import * as InterviewScreen from '../../models/InterviewScreen';

export interface InterviewServiceAPI {
  InterviewAPI: {
    createInterview(interview: Interview.T): Promise<Interview.T>;
    getAllInterviews(): Promise<Interview.T[]>;
    getInterview(interviewId: string): Promise<Interview.T>;
    updateInterview(
      interviewId: string,
      interview: Interview.T,
    ): Promise<Interview.T>;
  };

  InterviewScreenAPI: {
    createInterviewScreen(
      screen: InterviewScreen.T,
    ): Promise<InterviewScreen.T>;
    getInterviewScreen(screenId: string): Promise<InterviewScreen.T>;
    updateInterviewScreen(
      screenId: string,
      screen: InterviewScreen.T,
    ): Promise<InterviewScreen.T>;
  };
}
