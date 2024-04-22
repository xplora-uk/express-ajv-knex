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

  adaptManyRows = (rows: Array<Partial<TRow>>, _ctx: IContext): Array<Partial<TRow>> => {
    return rows;
  };

  // with this style, no need to bind this in constructor; as we need to use handler with express app
  selectMany = async (req: Request, res: Response): Promise<void> => {
    const ctx      = { req, res };
    const selector = convertRequestQueryToDbSelector(req.query, this.columnNamesSelectable);
    const count    = await this.repo.selectCount({ criteria: selector.criteria });
    const rows     = await this.repo.selectMany(selector);
    const data     = rows ? this.adaptManyRows(rows, ctx) : [];
    const page     = { limit: selector.limit, offset: selector.offset, count: count || 0 };
    res.json({ data, page });
  }

  adaptOneRow = (row: Partial<TRow>, _ctx: IContext): Partial<TRow> => {
    return row;
  };

  // with this style, no need to bind this in constructor; as we need to use handler with express app
  selectOne = async (req: Request, res: Response): Promise<void> => {
    const ctx     = { req, res };
    const id      = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const columns = convertRequestQueryToDbColumns(req.query, this.columnNamesSelectable);
    const row = await this.repo.selectOne({
      columns,
      criteria: [{ k: 'id', o: '$eq', v: id }],
    });
    const data = row ? this.adaptOneRow(row, ctx) : null;
    res.json({ data });
  }

  private _beforeInsertOne = async (rawRow: Partial<TRow>, _ctx: IContext): Promise<IPartialRowExtended<TRow>> => {
    // check/change row
    return {
      ...rawRow,
      id: uuidV4(),
      createdAtUtc: new Date(),
      updatedAtUtc: new Date(),
    };
  }

  beforeInsertOne = async (rawRow: IPartialRowExtended<TRow>, _ctx: IContext): Promise<IPartialRowExtended<TRow>> => {
    return rawRow;
  }

  // with this style, no need to bind this in constructor; as we need to use handler with express app
  insertOne = async (req: Request, res: Response): Promise<void> => {
    const ctx: IContext = { req, res };
    const rawRow = convertHttpRequestBodyToRow<TRow>(req.body, this.columnNamesCreatable);
    let row = await this._beforeInsertOne(rawRow, ctx);
    row = await this.beforeInsertOne(row, ctx);
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

  private _beforeUpdateOne = async (change: Partial<TRow>, _oldRow: TRow, _ctx: IContext): Promise<IPartialRowWithUpdate<TRow>> => {
    // extract id and createdAtUtc to avoid update
    const { id, createdAtUtc, ...otherChange } = change as any;
    return {
      ...otherChange,
      updatedAtUtc: new Date(),
    };
  }

  beforeUpdateOne = async (change: IPartialRowWithUpdate<TRow>, _oldRow: TRow, _ctx: IContext): Promise<IPartialRowWithUpdate<TRow>> => {
    return change;
  }

  /**
   * Update one record
   * With this style, no need to bind this in constructor; as we need to use handler with express app
   * @param req 
   * @param res 
   * @returns 
   */
  updateOne = async (req: Request, res: Response): Promise<void> => {
    const ctx: IContext = { req, res };
    const id = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const rawChange = convertHttpRequestBodyToRow<TRow>(req.body, this.columnNamesUpdatable);
    const oldRow = await this.repo.selectOne({ criteria: [{ k: 'id', o: '$eq', v: id }] });
    if (!oldRow) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    let change = await this._beforeUpdateOne(rawChange, oldRow, ctx);
    change = await this.beforeUpdateOne(change, oldRow, ctx);
    const data = await this.repo.updateOne(id, change);
    res.json({ data });
    try {
      await this.afterUpdateOne(change, oldRow, ctx);
    } catch (error) {
      this.logger.error({ msg: this.name + 'afterUpdate failed', data: { error, id, rawChange, oldRow }});
    }
  }

  /**
   * Override this method to add custom logic after updating one record
   * @param _change 
   * @param _oldRow 
   * @param _ctx 
   * @returns 
   */
  afterUpdateOne = async (_change: Partial<TRow>, _oldRow: TRow, _ctx: IContext): Promise<void> => {
    return;
  }

  /**
   * Override this method to add custom logic before deleting one record
   * @param _oldRow 
   * @param _ctx 
   * @returns 
   */
  beforeDeleteOne = async (_oldRow: TRow, _ctx: IContext): Promise<void> => {
    return;
  }

  /**
   * Delete one record
   * With this style, no need to bind this in constructor; as we need to use handler with express app
   * @param req 
   * @param res 
   * @returns 
   */
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

  /**
   * Override this method to add custom logic after deleting one record
   * @param _oldRow 
   * @param _ctx 
   * @returns 
   */
  afterDeleteOne = async (_oldRow: TRow, _ctx: IContext): Promise<void> => {
    return;
  };
}
