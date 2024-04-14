import { ILogger } from '@xplora-uk/logger';
import { Request, Response } from 'express';
import { IBasicDbRepo, IPartialRowExtended, IPartialRowWithUpdate } from '../types';
import { ErrorObject } from 'ajv';

export interface IValidatorMiddlewareOptions {
  openApiSpecFilePath: string;
}

export interface IResourceOptions {
  tableName   : string;
  path       ?: string;
  openApiSpec?: any;
  schemas    ?: {
    insertOne ?: string;
    selectMany?: string;
    selectOne ?: string;
    updateOne ?: string;
    deleteOne ?: string;
  };
  onValidationErrors?: (errors: ErrorObject[], schema: string, req: Request) => Promise<void> | void;
}

export interface IResourceController<TRow extends {} = any> {
  repo      : IBasicDbRepo<TRow>;
  logger    : ILogger;

  insertOne       : (req: Request, res: Response) => Promise<void>; // match express + http.server callback style
  beforeInsertOne?: (rawRow: Partial<TRow>, ctx: IContext) => Promise<IPartialRowExtended<TRow>>;
  afterInsertOne ?: (row: IPartialRowExtended<TRow>, ctx: IContext) => Promise<void>;

  selectMany: (req: Request, res: Response) => Promise<void>; // match express + http.server callback style

  selectOne : (req: Request, res: Response) => Promise<void>; // match express + http.server callback style

  updateOne       : (req: Request, res: Response) => Promise<void>; // match express + http.server callback style
  beforeUpdateOne?: (change: Partial<TRow>, oldRow: TRow, ctx: IContext) => Promise<IPartialRowWithUpdate<TRow>>;
  afterUpdateOne ?: (change: Partial<TRow>, oldRow: TRow, ctx: IContext) => Promise<void>;

  deleteOne       : (req: Request, res: Response) => Promise<void>; // match express + http.server callback style
  beforeDeleteOne?: (oldRow: TRow, ctx: IContext) => Promise<void>;
  afterDeleteOne ?: (oldRow: TRow, ctx: IContext) => Promise<void>;
}

export interface IContext {
  req: Request;
  res: Response;
}
