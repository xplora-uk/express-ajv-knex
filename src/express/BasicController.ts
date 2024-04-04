import { ILogger } from '@xplora-uk/logger';
import { Request, Response } from 'express';

import { BasicDbRepo } from '../knex/BasicDbRepo';
import { IResourceController } from './types';
import { convertHttpRequestBodyToRow, convertRequestQueryToDbColumns, convertRequestQueryToDbSelector, extractIdFromHttpPathParams, uuidV4 } from '../utils';
import { IPartialRowExtended, IPartialRowWithUpdate } from '../types';

export class BasicController<TRow extends {} = any> implements IResourceController<TRow> {
  name = 'BasicController';
  columnNamesSelectable: string[];
  columnNamesCreatable: string[];
  columnNamesUpdatable: string[];
  idParamPlaceHolder = 'id';
  constructor(
    public repo: BasicDbRepo<TRow>,
    public logger: ILogger,
  ) {
    this.insertOne  = this.insertOne.bind(this);
    this.selectMany = this.selectMany.bind(this);
    this.selectOne  = this.selectOne.bind(this);
    this.updateOne  = this.updateOne.bind(this);
    this.deleteOne  = this.deleteOne.bind(this);

    // local cache
    this.columnNamesSelectable = repo.columnNamesCreatable;
    this.columnNamesCreatable  = repo.columnNamesCreatable;
    this.columnNamesUpdatable  = repo.columnNamesUpdatable;
  }

  async selectMany(req: Request, res: Response): Promise<void> {
    const selector = convertRequestQueryToDbSelector(req.query, this.columnNamesSelectable);
    const count    = await this.repo.selectCount({ criteria: selector.criteria });
    const result   = await this.repo.selectMany(selector);
    const data     = result || [];
    const page     = { limit: selector.limit, offset: selector.offset, count: count || 0 };
    res.json({ data, page });
  }

  async selectOne(req: Request, res: Response): Promise<void> {
    const id      = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const columns = convertRequestQueryToDbColumns(req.query, this.columnNamesSelectable);
    const data = await this.repo.selectOne({
      columns,
      criteria: [{ k: 'id', v: id }],
    });
    res.json({ data });
  }

  protected async beforeInsertOne(rawRow: Partial<TRow>): Promise<IPartialRowExtended<TRow>> {
    // check/change row
    return {
      ...rawRow,
      id: uuidV4(),
      createdAtUtc: new Date(),
      updatedAtUtc: new Date(),
    };
  }

  async insertOne(req: Request, res: Response): Promise<void> {
    const rawRow = convertHttpRequestBodyToRow<TRow>(req.body, this.columnNamesCreatable);
    const row = await this.beforeInsertOne(rawRow);
    const id = await this.repo.insertOne(row);
    res.json({ data: id ? { id } : null });
    try {
      await this.afterInsertOne(row);
    } catch (error) {
      this.logger.error({ msg: this.name + '.afterInsert failed', data: { error, row }});
    }
  }

  protected async afterInsertOne(_row: IPartialRowExtended<TRow>): Promise<void> {
    return;
  }

  protected async beforeUpdateOne(change: Partial<TRow>, _oldRow: TRow): Promise<IPartialRowWithUpdate<TRow>> {
    // extract id and createdAtUtc to avoid update
    const { id, createdAtUtc, ...otherChange } = change as any;
    return {
      ...otherChange,
      updatedAtUtc: new Date(),
    };
  }

  async updateOne(req: Request, res: Response): Promise<void> {
    const id = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const rawChange = convertHttpRequestBodyToRow<TRow>(req.body, this.columnNamesUpdatable);
    const oldRow = await this.repo.selectOne({ criteria: [{ k: 'id', v: id }] });
    if (!oldRow) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    const change = await this.beforeUpdateOne(rawChange, oldRow);
    const data = await this.repo.updateOne(id, change);
    res.json({ data });
    try {
      await this.afterUpdateOne(change, oldRow);
    } catch (error) {
      this.logger.error({ msg: this.name + 'afterUpdate failed', data: { error, id, rawChange, oldRow }});
    }
  }

  protected async afterUpdateOne(_change: Partial<TRow>, _oldRow: TRow): Promise<void> {
    return;
  }

  protected async beforeDeleteOne(_oldRow: TRow): Promise<void> {
    return;
  }

  async deleteOne(req: Request, res: Response): Promise<void> {
    const id = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const oldRow = await this.repo.selectOne({ criteria: [{ k: 'id', v: id }] });
    if (!oldRow) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    await this.beforeDeleteOne(oldRow);
    const data = await this.repo.deleteOne(id);
    res.json({ data });
    try {
      await this.afterDeleteOne(oldRow);
    } catch (error) {
      this.logger.error({ msg: this.name + 'afterDelete failed', data: { error, id }});
    }
  }

  protected async afterDeleteOne(_oldRow: TRow): Promise<void> {
    return;
  }
}
