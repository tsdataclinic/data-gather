/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SerializedGoogleSheetsOAuthData } from '../models/SerializedGoogleSheetsOAuthData';
import type { SerializedInterviewRead } from '../models/SerializedInterviewRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class GoogleSheetsFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Google Sheets Oauth Callback
   * This is the callback from when an OAuth flow is completed on the browser.
   * We receive the access token, and other auth data, and store it into a
   * DataStoreSetting model.
   * @param requestBody
   * @returns SerializedInterviewRead Successful Response
   * @throws ApiError
   */
  public googleSheetsOauthCallback(
    requestBody: SerializedGoogleSheetsOAuthData,
  ): CancelablePromise<SerializedInterviewRead> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/google-sheets-oauth-callback',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
