/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DefaultFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Hello Api
   * @returns any Successful Response
   * @throws ApiError
   */
  public helloApiGet(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/',
    });
  }

}
