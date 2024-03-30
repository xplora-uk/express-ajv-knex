import { ILogger } from '@xplora-uk/logger';
import { Request, Response } from 'express';
import { IBasicDbRepo } from '../types';

export interface IValidatorMiddlewareOptions {
  openApiSpecFilePath: string;
}

export interface IResourceOptions {
  tableName : string;
  path     ?: string;
  schemas  ?: {
    create      : string;
    retrieveMany: string;
    retrieve    : string;
    update      : string;
    delete      : string;
  };
}

export interface IResourceController<TRow extends {} = any> {
  repo      : IBasicDbRepo<TRow>;
  logger    : ILogger;
  insert    : (req: Request, res: Response) => Promise<void>;
  selectMany: (req: Request, res: Response) => Promise<void>;
  select    : (req: Request, res: Response) => Promise<void>;
  update    : (req: Request, res: Response) => Promise<void>;
  delete    : (req: Request, res: Response) => Promise<void>;
}
