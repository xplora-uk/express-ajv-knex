import { ILogger } from '@xplora-uk/logger';
import { Request, Response } from 'express';

import { BasicDbRepo } from '../knex/BasicDbRepo';
import { IContext, IResourceController } from './types';
import { convertHttpRequestBodyToRow, convertRequestQueryToDbColumns, convertRequestQueryToDbSelector, extractIdFromHttpPathParams, uuidV4 } from '../utils';
import { IPartialRowExtended, IPartialRowWithUpdate } from '../types';

export class BasicController<TRow extends {} = any> implements IResourceController<TRow> {
  name = 'BasicController';
  columnNamesSelectable: string[];
  columnNamesCreatable: string[];
  columnNamesUpdatable: string[];
  constructor(
    public repo: BasicDbRepo<TRow>,
    public logger: ILogger,
    public idParamPlaceHolder = 'id',
  ) {
    // local cache
    this.columnNamesSelectable = repo.columnNamesCreatable;
    this.columnNamesCreatable  = repo.columnNamesCreatable;
    this.columnNamesUpdatable  = repo.columnNamesUpdatable;
  }

  // with this style, no need to bind this in constructor; as we need to use handler with express app
  selectMany = async (req: Request, res: Response): Promise<void> => {
    const selector = convertRequestQueryToDbSelector(req.query, this.columnNamesSelectable);
    const count    = await this.repo.selectCount({ criteria: selector.criteria });
    const result   = await this.repo.selectMany(selector);
    const data     = result || [];
    const page     = { limit: selector.limit, offset: selector.offset, count: count || 0 };
    res.json({ data, page });
  }

  // with this style, no need to bind this in constructor; as we need to use handler with express app
  selectOne = async (req: Request, res: Response): Promise<void> => {
    const id      = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const columns = convertRequestQueryToDbColumns(req.query, this.columnNamesSelectable);
    const data = await this.repo.selectOne({
      columns,
      criteria: [{ k: 'id', o: '$eq', v: id }],
    });
    res.json({ data });
  }

  beforeInsertOne = async (rawRow: Partial<TRow>, _ctx: IContext): Promise<IPartialRowExtended<TRow>> => {
    // check/change row
    return {
      ...rawRow,
      id: uuidV4(),
      createdAtUtc: new Date(),
      updatedAtUtc: new Date(),
    };
  }

  // with this style, no need to bind this in constructor; as we need to use handler with express app
  insertOne = async (req: Request, res: Response): Promise<void> => {
    const ctx: IContext = { req, res };
    const rawRow = convertHttpRequestBodyToRow<TRow>(req.body, this.columnNamesCreatable);
    const row = await this.beforeInsertOne(rawRow, ctx);
    const id = await this.repo.insertOne(row);
    res.json({ data: id ? { id } : null });
    try {
      await this.afterInsertOne(row, ctx);
    } catch (error) {
      this.logger.error({ msg: this.name + '.afterInsert failed', data: { error, row }});
    }
  }

  afterInsertOne = async (_row: IPartialRowExtended<TRow>, _ctx: IContext): Promise<void> => {
    return;
  }

  beforeUpdateOne = async (change: Partial<TRow>, _oldRow: TRow, _ctx: IContext): Promise<IPartialRowWithUpdate<TRow>> => {
    // extract id and createdAtUtc to avoid update
    const { id, createdAtUtc, ...otherChange } = change as any;
    return {
      ...otherChange,
      updatedAtUtc: new Date(),
    };
  }

  // with this style, no need to bind this in constructor; as we need to use handler with express app
  updateOne = async (req: Request, res: Response): Promise<void> => {
    const ctx: IContext = { req, res };
    const id = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const rawChange = convertHttpRequestBodyToRow<TRow>(req.body, this.columnNamesUpdatable);
    const oldRow = await this.repo.selectOne({ criteria: [{ k: 'id', o: '$eq', v: id }] });
    if (!oldRow) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    const change = await this.beforeUpdateOne(rawChange, oldRow, ctx);
    const data = await this.repo.updateOne(id, change);
    res.json({ data });
    try {
      await this.afterUpdateOne(change, oldRow, ctx);
    } catch (error) {
      this.logger.error({ msg: this.name + 'afterUpdate failed', data: { error, id, rawChange, oldRow }});
    }
  }

  afterUpdateOne = async (_change: Partial<TRow>, _oldRow: TRow, _ctx: IContext): Promise<void> => {
    return;
  }

  beforeDeleteOne = async (_oldRow: TRow, _ctx: IContext): Promise<void> => { return; }

  // with this style, no need to bind this in constructor; as we need to use handler with express app
  deleteOne = async (req: Request, res: Response): Promise<void> => {
    const ctx = { req, res };
    const id = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const oldRow = await this.repo.selectOne({ criteria: [{ k: 'id', o: '$eq', v: id }] });
    if (!oldRow) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    await this.beforeDeleteOne(oldRow, ctx);
    const data = await this.repo.deleteOne(id);
    res.json({ data });
    try {
      await this.afterDeleteOne(oldRow, ctx);
    } catch (error) {
      this.logger.error({ msg: this.name + 'afterDelete failed', data: { error, id }});
    }
  }

  afterDeleteOne = async (_oldRow: TRow, _ctx: IContext): Promise<void> => { return; };
}
