import * as Interview from '../../models/Interview';

export interface InterviewServiceAPI {
  createInterview(name: string, description: string): Promise<Interview.T>;
  getAllInterviews(): Promise<Interview.T[]>;
}
