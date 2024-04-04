import { ILogger } from '@xplora-uk/logger';
import { Application, NextFunction, Request, Response } from 'express';

export function errorHandlerForExpressApp(
  app: Application,
  logger: ILogger,
) {

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
