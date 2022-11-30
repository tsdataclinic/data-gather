/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SerializedInterviewScreenCreate } from '../models/SerializedInterviewScreenCreate';
import type { SerializedInterviewScreenRead } from '../models/SerializedInterviewScreenRead';
import type { SerializedInterviewScreenReadWithChildren } from '../models/SerializedInterviewScreenReadWithChildren';
import type { SerializedInterviewScreenUpdate } from '../models/SerializedInterviewScreenUpdate';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class InterviewScreensFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Get Interview Screen
   * @param screenId
   * @returns SerializedInterviewScreenReadWithChildren Successful Response
   * @throws ApiError
   */
  public getInterviewScreen(
    screenId: string,
  ): CancelablePromise<SerializedInterviewScreenReadWithChildren> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/interview_screens/{screen_id}',
      path: {
        'screen_id': screenId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Interview Screen
   * Update an Interview Screen. This API function updates the values
   * of an InterviewScreen as well as its nested Conditional Actions
   * and Entries.
   * @param screenId
   * @param requestBody
   * @returns SerializedInterviewScreenReadWithChildren Successful Response
   * @throws ApiError
   */
  public updateInterviewScreen(
    screenId: string,
    requestBody: SerializedInterviewScreenUpdate,
  ): CancelablePromise<SerializedInterviewScreenReadWithChildren> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/interview_screens/{screen_id}',
      path: {
        'screen_id': screenId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Interview Screen
   * @param requestBody
   * @returns SerializedInterviewScreenRead Successful Response
   * @throws ApiError
   */
  public createInterviewScreen(
    requestBody: SerializedInterviewScreenCreate,
  ): CancelablePromise<SerializedInterviewScreenRead> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/interview_screens/',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
