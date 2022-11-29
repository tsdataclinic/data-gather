/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';

import { DefaultFastAPIService } from './services/DefaultFastAPIService';
import { InterviewsFastAPIService } from './services/InterviewsFastAPIService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class APIService {
  public readonly default: DefaultFastAPIService;
  public readonly interviews: InterviewsFastAPIService;

  public readonly request: BaseHttpRequest;

  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = FetchHttpRequest,
  ) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? '',
      VERSION: config?.VERSION ?? '0.1.0',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });

    this.default = new DefaultFastAPIService(this.request);
    this.interviews = new InterviewsFastAPIService(this.request);
  }
}
