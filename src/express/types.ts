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
    insertOne : string;
    selectMany: string;
    selectOne : string;
    updateOne : string;
    deleteOne : string;
  };
}

export interface IResourceController<TRow extends {} = any> {
  repo      : IBasicDbRepo<TRow>;
  logger    : ILogger;
  insertOne : (req: Request, res: Response) => Promise<void>;
  selectMany: (req: Request, res: Response) => Promise<void>;
  selectOne : (req: Request, res: Response) => Promise<void>;
  updateOne : (req: Request, res: Response) => Promise<void>;
  deleteOne : (req: Request, res: Response) => Promise<void>;
}
