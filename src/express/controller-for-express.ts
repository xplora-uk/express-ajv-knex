import { ILogger } from '@xplora-uk/logger';
import { Application } from 'express';

import { BasicDbRepo } from '../knex/BasicDbRepo';
import { IBasicDbService } from '../types';
import { IResourceOptions } from './types';
import { BasicController } from './BasicController';

export function useControllerForExpressApp<TRow extends {} = any>({
  app,
  options,
  db,
  logger,
  repo,
  controller,
}: {
  app        : Application;
  options    : IResourceOptions;
  db         : IBasicDbService;
  logger     : ILogger;
  repo      ?: BasicDbRepo<TRow>;
  controller?: BasicController<TRow>;
}) {
  repo = repo || db.repo<TRow>(options.tableName, new BasicDbRepo<TRow>(db, options.tableName));
  controller = controller || new BasicController<TRow>(repo, logger);
  const prefix = options.path || `/${options.tableName}`;

  app.get   (`${prefix}/:${controller.idParamPlaceHolder}`, controller.selectOne);
  app.patch (`${prefix}/:${controller.idParamPlaceHolder}`, controller.updateOne);
  app.delete(`${prefix}/:${controller.idParamPlaceHolder}`, controller.deleteOne);

  app.post(prefix, controller.insertOne);
  app.get (prefix, controller.selectMany);
}
