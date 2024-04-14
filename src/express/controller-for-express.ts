import { ILogger } from '@xplora-uk/logger';
import { Application } from 'express';

import { BasicDbRepo } from '../knex/BasicDbRepo';
import { IBasicDbService } from '../types';
import { IResourceOptions } from './types';
import { BasicController } from './BasicController';
import { makeValidatorMiddlewareForExpress } from './validator-middleware-for-express';

export function useControllerForExpressApp<TRow extends {} = any>({
  app,
  options,
  db,
  logger,
  repo,
  controller,
  withValidators = false,
}: {
  app            : Application;
  options        : IResourceOptions;
  db             : IBasicDbService;
  logger         : ILogger;
  repo          ?: BasicDbRepo<TRow>;
  controller    ?: BasicController<TRow>;
  withValidators?: boolean;
}) {
  repo = repo || db.repo<TRow>(options.tableName, new BasicDbRepo<TRow>(db, options.tableName));
  controller = controller || new BasicController<TRow>(repo, logger);
  const prefix = options.path || `/${options.tableName}`;

  if (withValidators) {
    const mware = makeValidatorMiddlewareForExpress(options);

    app.get   (`${prefix}/:${controller.idParamPlaceHolder}`, controller.selectOne);
    app.delete(`${prefix}/:${controller.idParamPlaceHolder}`, controller.deleteOne);
    app.patch (`${prefix}/:${controller.idParamPlaceHolder}`, mware.middlewareToUpdate, controller.updateOne);

    app.post(prefix, mware.middlewareToInsert, controller.insertOne);
    app.get (prefix, mware.middlewareToSelectMany, controller.selectMany);

  } else {

    app.get   (`${prefix}/:${controller.idParamPlaceHolder}`, controller.selectOne);
    app.delete(`${prefix}/:${controller.idParamPlaceHolder}`, controller.deleteOne);
    app.patch (`${prefix}/:${controller.idParamPlaceHolder}`, controller.updateOne);

    app.post(prefix, controller.insertOne);
    app.get (prefix, controller.selectMany);
  }
}
