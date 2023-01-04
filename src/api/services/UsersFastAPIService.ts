/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SerializedUserRead } from '../models/SerializedUserRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UsersFastAPIService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Get Self User
   * @returns SerializedUserRead Successful Response
   * @throws ApiError
   */
  public getSelfUser(): CancelablePromise<SerializedUserRead> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/user/self',
    });
  }

}
