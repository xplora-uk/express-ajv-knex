import { ILogger } from '@xplora-uk/logger';
import { NextFunction, Request, Response } from 'express';

export function errorHandlerForExpressApp(logger: ILogger) {
  return (err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || (status < 500 ? 'Invalid request' : 'Server error');
    res.status(status).json({
      errors: err.errors ?? [{ message }],
    });
    if (status < 500) logger.warn({ msg: message, data: err });
    if (status >= 500) logger.error({ msg: message, data: err });
  };
}
