/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class AirtableFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Get Airtable Records
   * Fetch records from an airtable table. Filtering can be performed
   * by adding query parameters to the URL, keyed by column name.
   * @param baseId
   * @param tableName
   * @param interviewId
   * @returns any Successful Response
   * @throws ApiError
   */
  public getAirtableRecords(
    baseId: any,
    tableName: any,
    interviewId: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/airtable-records/{interview_id}/{base_id}/{table_name}',
      path: {
        'base_id': baseId,
        'table_name': tableName,
        'interview_id': interviewId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Airtable Record
   * Create an airtable record in a table.
   * @param baseId
   * @param tableName
   * @param interviewId
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public createAirtableRecord(
    baseId: string,
    tableName: string,
    interviewId: string,
    requestBody: any,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/airtable-records/{interview_id}/{base_id}/{table_name}',
      path: {
        'base_id': baseId,
        'table_name': tableName,
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
   * Get Airtable Record
   * Fetch record with a particular id from a table in airtable.
   * @param baseId
   * @param tableName
   * @param recordId
   * @param interviewId
   * @returns any Successful Response
   * @throws ApiError
   */
  public getAirtableRecord(
    baseId: string,
    tableName: string,
    recordId: string,
    interviewId: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/airtable-records/{interview_id}/{base_id}/{table_name}/{record_id}',
      path: {
        'base_id': baseId,
        'table_name': tableName,
        'record_id': recordId,
        'interview_id': interviewId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Airtable Record
   * Update an airtable record in a table.
   * @param baseId
   * @param tableName
   * @param recordId
   * @param interviewId
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public updateAirtableRecord(
    baseId: string,
    tableName: string,
    recordId: string,
    interviewId: string,
    requestBody: any,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/airtable-records/{interview_id}/{base_id}/{table_name}/{record_id}',
      path: {
        'base_id': baseId,
        'table_name': tableName,
        'record_id': recordId,
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
   * Get Airtable Schema
   * Given an interview object, fetch the list of bases + schema for each base
   * for its given Airtable access key.
   * Combine the schema into a single JSON object.
   * Update a given Interview object with that schema.
   * @param interviewId
   * @returns any Successful Response
   * @throws ApiError
   */
  public getAirtableSchema(
    interviewId: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/airtable-schema/{interview_id}',
      path: {
        'interview_id': interviewId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Airtable Auth
   * Since Airtable API doesn't yet support CORS requests to create tokens from the browser,
   * this function helps the browser complete the OAuth request.
   * - App => click 'connect to airtable', redirects to this endpoint
   * - This function sends 302 Redirect to Airtable OAuth screen -> user confirms
   * - On confirm, Airtable setup to redirectd back to callback App URL
   * - UI takes response data and continues handling auth from there.
   *
   * Most of this follows: https://github.com/Airtable/oauth-example
   * @param state
   * @param interviewId
   * @returns any Successful Response
   * @throws ApiError
   */
  public airtableAuth(
    state: string,
    interviewId: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/airtable-auth',
      query: {
        'state': state,
        'interview_id': interviewId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Airtable Callback
   * @returns string Successful Response
   * @throws ApiError
   */
  public airtableCallback(): CancelablePromise<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/airtable-callback',
    });
  }

  /**
   * Refresh And Update Airtable Auth
   * @param interviewId
   * @returns any Successful Response
   * @throws ApiError
   */
  public refreshAndUpdateAirtableAuth(
    interviewId: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/refresh-and-update-airtable-auth',
      query: {
        'interview_id': interviewId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
