import { Application } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';

import { IValidatorMiddlewareOptions } from './types';

export function validatorForExpressApp(
  app: Application,
  options: IValidatorMiddlewareOptions,
) {

  app.use(
    OpenApiValidator.middleware({
      apiSpec: options.openApiSpecFilePath || './openapi.yaml',
      validateRequests: true,   // (default)
      validateResponses: false, // false by default
    }),
  );
}
