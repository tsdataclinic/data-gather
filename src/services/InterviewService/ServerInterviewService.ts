import * as Interview from '../../models/Interview';
import { InterviewServiceAPI } from './InterviewServiceAPI';

/* eslint-disable class-methods-use-this */
export default class ServerInterviewService implements InterviewServiceAPI {
  createInterview(name: string, description: string): Promise<Interview.T> {
    return Promise.resolve(Interview.create({ name, description }));
  }

  async getAllInterviews(): Promise<Interview.T[]> {
    console.log('sending');
    const response = await fetch('/api/interviews', { method: 'GET' });
    console.log('response', response);
    const data = await response.json();
    console.log('data', data);
    return Promise.resolve([]);
  }
}
/* eslint-enable */
