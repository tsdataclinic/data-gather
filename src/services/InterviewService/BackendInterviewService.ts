import * as Interview from '../../models/Interview';
import { InterviewServiceAPI } from './InterviewServiceAPI';
import { FastAPIService } from '../../api/FastAPIService';

/* eslint-disable class-methods-use-this */
export default class ServerInterviewService implements InterviewServiceAPI {
  private api = new FastAPIService();

  createInterview(name: string, description: string): Promise<Interview.T> {
    return Promise.resolve(Interview.create({ name, description }));
  }

  async getAllInterviews(): Promise<Interview.T[]> {
    const serializedInterviews =
      await this.api.interviews.getInterviewsApiInterviewsGet();
    console.log('HERE IT IS', serializedInterviews);

    return serializedInterviews.map(Interview.deserialize);
  }

  async getInterview(interview_id: string): Promise<Interview.T> {
    const serializedInterview =
      await this.api.interviews.getInterviewApiInterviewsInterviewIdGet(
        interview_id,
      );
    console.log('SINGLE INTERVIEW', serializedInterview);

    return Interview.deserialize(serializedInterview);
  }
}
/* eslint-enable */
