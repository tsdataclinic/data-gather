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
}
/* eslint-enable */
