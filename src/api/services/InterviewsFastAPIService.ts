/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Interview } from '../models/Interview';
import type { InterviewWithScreens } from '../models/InterviewWithScreens';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class InterviewsFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Get Interviews
   * @returns Interview Successful Response
   * @throws ApiError
   */
  public getInterviews(): CancelablePromise<Array<Interview>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/interviews/',
    });
  }

  /**
   * Create Interview
   * @param requestBody
   * @returns Interview Successful Response
   * @throws ApiError
   */
  public createInterview(
    requestBody: Interview,
  ): CancelablePromise<Interview> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/interviews/',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Interview
   * @param interviewId
   * @returns InterviewWithScreens Successful Response
   * @throws ApiError
   */
  public getInterview(
    interviewId: string,
  ): CancelablePromise<InterviewWithScreens> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/interviews/{interview_id}',
      path: {
        'interview_id': interviewId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Interview
   * @param interviewId
   * @param requestBody
   * @returns Interview Successful Response
   * @throws ApiError
   */
  public updateInterview(
    interviewId: string,
    requestBody: Interview,
  ): CancelablePromise<Interview> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/interviews/{interview_id}',
      path: {
        'interview_id': interviewId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
