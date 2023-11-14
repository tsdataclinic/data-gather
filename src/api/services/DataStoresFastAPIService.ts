/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DataStoreType } from '../models/DataStoreType';
import type { SerializedGoogleSheetsUpdateSchemaOptions } from '../models/SerializedGoogleSheetsUpdateSchemaOptions';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DataStoresFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Update Data Store Schema
   * Fetch the updated data store schema for a given data store type (e.g.
   * airtable or google sheets) and store the updated schema for the given
   * interview id.
   * @param dataStoreType
   * @param interviewId
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public updateDataStoreSchema(
    dataStoreType: DataStoreType,
    interviewId: string,
    requestBody?: SerializedGoogleSheetsUpdateSchemaOptions,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/data-store/{data_store_type}/update-schema/{interview_id}',
      path: {
        'data_store_type': dataStoreType,
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
