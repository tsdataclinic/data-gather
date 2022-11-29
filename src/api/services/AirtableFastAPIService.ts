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
   * @returns any Successful Response
   * @throws ApiError
   */
  public getAirtableRecords(
    tableName: any,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/airtable-records/{table_name}',
      path: {
        'table_name': tableName,
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
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public createAirtableRecord(
    tableName: string,
    requestBody: any,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/airtable-records/{table_name}',
      path: {
        'table_name': tableName,
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
   * @returns any Successful Response
   * @throws ApiError
   */
  public getAirtableRecord(
    tableName: string,
    recordId: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/airtable-records/{table_name}/{record_id}',
      path: {
        'table_name': tableName,
        'record_id': recordId,
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
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public updateAirtableRecord(
    tableName: string,
    recordId: string,
    requestBody: any,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/airtable-records/{table_name}/{record_id}',
      path: {
        'table_name': tableName,
        'record_id': recordId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
