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
   * @param tableName
   * @param baseId
   * @param interviewId
   * @returns any Successful Response
   * @throws ApiError
   */
  public getAirtableRecords(
    tableName: any,
    baseId: string,
    interviewId: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/airtable-records/{table_name}',
      path: {
        'table_name': tableName,
      },
      query: {
        'base_id': baseId,
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
   * @param tableName
   * @param baseId
   * @param interviewId
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public createAirtableRecord(
    tableName: string,
    baseId: string,
    interviewId: string,
    requestBody: any,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/airtable-records/{table_name}',
      path: {
        'table_name': tableName,
      },
      query: {
        'base_id': baseId,
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
   * @param tableName
   * @param recordId
   * @param baseId
   * @param interviewId
   * @returns any Successful Response
   * @throws ApiError
   */
  public getAirtableRecord(
    tableName: string,
    recordId: string,
    baseId: string,
    interviewId: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/airtable-records/{table_name}/{record_id}',
      path: {
        'table_name': tableName,
        'record_id': recordId,
      },
      query: {
        'base_id': baseId,
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
   * @param tableName
   * @param recordId
   * @param baseId
   * @param interviewId
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public updateAirtableRecord(
    tableName: string,
    recordId: string,
    baseId: string,
    interviewId: string,
    requestBody: any,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/airtable-records/{table_name}/{record_id}',
      path: {
        'table_name': tableName,
        'record_id': recordId,
      },
      query: {
        'base_id': baseId,
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
   * Interview must have an associated InterviewSettings object
   * List bases given an interview ID
   * For each base -
   * Fetch base schema
   * call interview update after?
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

}
