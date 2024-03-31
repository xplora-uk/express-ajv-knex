import { ILogger } from '@xplora-uk/logger';
import { Application } from 'express';

import { BasicDbRepo } from '../knex/BasicDbRepo';
import { IBasicDbService } from '../types';
import { IResourceOptions } from './types';
import { BasicController } from './BasicController';

export function controllerForExpressApp<TRow extends {} = any>(
  app: Application,
  options: IResourceOptions,
  db: IBasicDbService,
  logger: ILogger,
  repo = db.repo<TRow>(options.tableName, new BasicDbRepo<TRow>(db, options.tableName)),
  controller = new BasicController<TRow>(repo, logger),
) {

  const prefix = options.path || `/${options.tableName}`;

  app.get   (`${prefix}/:${controller.idParamPlaceHolder}`, controller.select);
  app.patch (`${prefix}/:${controller.idParamPlaceHolder}`, controller.update);
  app.delete(`${prefix}/:${controller.idParamPlaceHolder}`, controller.delete);

  app.post(prefix, controller.insert);
  app.get (prefix, controller.selectMany);
}
