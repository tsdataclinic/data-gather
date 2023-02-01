/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SerializedInterviewCreate } from '../models/SerializedInterviewCreate';
import type { SerializedInterviewRead } from '../models/SerializedInterviewRead';
import type { SerializedInterviewReadWithScreensAndActions } from '../models/SerializedInterviewReadWithScreensAndActions';
import type { SerializedInterviewScreenEntryReadWithScreen } from '../models/SerializedInterviewScreenEntryReadWithScreen';
import type { SerializedInterviewUpdate } from '../models/SerializedInterviewUpdate';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class InterviewsFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Get Interviews
   * @returns SerializedInterviewRead Successful Response
   * @throws ApiError
   */
  public getInterviews(): CancelablePromise<Array<SerializedInterviewRead>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/interviews/',
    });
  }

  /**
   * Create Interview
   * Create an interview. An interview is created with a default screen to start
   * with.
   * @param requestBody
   * @returns SerializedInterviewRead Successful Response
   * @throws ApiError
   */
  public createInterview(
    requestBody: SerializedInterviewCreate,
  ): CancelablePromise<SerializedInterviewRead> {
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
   * @returns SerializedInterviewReadWithScreensAndActions Successful Response
   * @throws ApiError
   */
  public getInterview(
    interviewId: string,
  ): CancelablePromise<SerializedInterviewReadWithScreensAndActions> {
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
   * @returns SerializedInterviewRead Successful Response
   * @throws ApiError
   */
  public updateInterview(
    interviewId: string,
    requestBody: SerializedInterviewUpdate,
  ): CancelablePromise<SerializedInterviewRead> {
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

  /**
   * Get Interview By Vanity Url
   * Get a published Interview by its vanity url
   * @param vanityUrl
   * @returns SerializedInterviewReadWithScreensAndActions Successful Response
   * @throws ApiError
   */
  public getInterviewByVanityUrl(
    vanityUrl: string,
  ): CancelablePromise<SerializedInterviewReadWithScreensAndActions> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/interviews/by-vanity-url/{vanity_url}',
      path: {
        'vanity_url': vanityUrl,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Interview Entries
   * @param interviewId
   * @returns SerializedInterviewScreenEntryReadWithScreen Successful Response
   * @throws ApiError
   */
  public getInterviewEntries(
    interviewId: string,
  ): CancelablePromise<Array<SerializedInterviewScreenEntryReadWithScreen>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/interviews/{interview_id}/entries',
      path: {
        'interview_id': interviewId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Interview Starting State
   * @param interviewId
   * @param requestBody
   * @returns SerializedInterviewReadWithScreensAndActions Successful Response
   * @throws ApiError
   */
  public updateInterviewStartingState(
    interviewId: string,
    requestBody: Array<string>,
  ): CancelablePromise<SerializedInterviewReadWithScreensAndActions> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/interviews/{interview_id}/starting_state',
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

  /**
   * Delete Interview
   * Delete an interview. Requires authentication.
   * Deletion is only allowed if the logged in user is the owner of the interview.
   * @param interviewId
   * @returns any Successful Response
   * @throws ApiError
   */
  public deleteInterview(
    interviewId: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/interview/{interview_id}',
      path: {
        'interview_id': interviewId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
