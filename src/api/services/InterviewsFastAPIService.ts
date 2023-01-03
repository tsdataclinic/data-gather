/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SerializedInterviewCreate } from '../models/SerializedInterviewCreate';
import type { SerializedInterviewRead } from '../models/SerializedInterviewRead';
import type { SerializedInterviewReadWithScreens } from '../models/SerializedInterviewReadWithScreens';
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
   * @returns SerializedInterviewReadWithScreens Successful Response
   * @throws ApiError
   */
  public getInterview(
    interviewId: string,
  ): CancelablePromise<SerializedInterviewReadWithScreens> {
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
   * Get a published Interview by it's vanity url
   * @param vanityUrl
   * @returns SerializedInterviewReadWithScreens Successful Response
   * @throws ApiError
   */
  public getInterviewByVanityUrl(
    vanityUrl: string,
  ): CancelablePromise<SerializedInterviewReadWithScreens> {
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
   * @returns SerializedInterviewReadWithScreens Successful Response
   * @throws ApiError
   */
  public updateInterviewStartingState(
    interviewId: string,
    requestBody: Array<string>,
  ): CancelablePromise<SerializedInterviewReadWithScreens> {
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

}
