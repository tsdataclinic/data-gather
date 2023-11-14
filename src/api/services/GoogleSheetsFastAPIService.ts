/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class GoogleSheetsFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Google Sheets Oauth Callback
   * This is the callback from when an OAuth flow is completed on the browser.
   * We receive the access token, and other auth data, and store it into a
   * DataStoreSetting model.
   * @param code
   * @param state
   * @param scope
   * @returns any Successful Response
   * @throws ApiError
   */
  public googleSheetsOauthCallback(
    code: string,
    state: string,
    scope: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/google-sheets-oauth-callback',
      query: {
        'code': code,
        'state': state,
        'scope': scope,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
