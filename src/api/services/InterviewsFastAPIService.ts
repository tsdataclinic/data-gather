/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Interview } from '../models/Interview';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class InterviewsFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Get Interviews
   * @returns Interview Successful Response
   * @throws ApiError
   */
  public getInterviewsApiInterviewsGet(): CancelablePromise<Array<Interview>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/interviews/',
    });
  }

  /**
   * Create Interview
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public createInterviewApiInterviewsPost(
    requestBody: Interview,
  ): CancelablePromise<any> {
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

}
