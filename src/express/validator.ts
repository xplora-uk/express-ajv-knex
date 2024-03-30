import { ILogger } from '@xplora-uk/logger';
import { Application, NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';

import { IValidatorMiddlewareOptions } from './types';

export function validatorForExpressApp(
  app: Application,
  options: IValidatorMiddlewareOptions,
  logger: ILogger,
) {

  app.use(
    OpenApiValidator.middleware({
      apiSpec: options.openApiSpecFilePath || './openapi.yaml',
      validateRequests: true,   // (default)
      validateResponses: false, // false by default
    }),
  );

  // error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({
      message: err.message,
      errors: err.errors,
    });
    if (status < 500) logger.warn({ msg: 'validation error', data: err });
    if (status >= 500) logger.error({ msg: 'server error', data: err });
  });
}
