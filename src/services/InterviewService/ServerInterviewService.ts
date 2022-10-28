import * as Interview from '../../models/Interview';
import { InterviewServiceAPI } from './InterviewServiceAPI';

/* eslint-disable class-methods-use-this */
export default class ServerInterviewService implements InterviewServiceAPI {
  createInterview(name: string, description: string): Promise<Interview.T> {
    return Promise.resolve(Interview.create({ name, description }));
  }

  getAllInterviews(): Promise<Interview.T[]> {
    return Promise.resolve([]);
  }
}
/* eslint-enable */
