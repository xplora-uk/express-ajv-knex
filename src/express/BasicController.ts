import { ILogger } from '@xplora-uk/logger';
import { Request, Response } from 'express';

import { BasicDbRepo } from '../knex/BasicDbRepo';
import { IResourceController } from './types';
import { convertHttpRequestBodyToRow, convertRequestQueryToDbColumns, convertRequestQueryToDbSelector, extractIdFromHttpPathParams } from '../utils/http';

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
    this.insert     = this.insert.bind(this);
    this.selectMany = this.selectMany.bind(this);
    this.select     = this.select.bind(this);
    this.update     = this.update.bind(this);
    this.delete     = this.delete.bind(this);

    // local cache
    this.columnNamesSelectable = repo.columnNamesCreatable();
    this.columnNamesCreatable  = repo.columnNamesCreatable();
    this.columnNamesUpdatable  = repo.columnNamesUpdatable();
  }

  async selectMany(req: Request, res: Response): Promise<void> {
    const selector = convertRequestQueryToDbSelector(req.query, this.columnNamesSelectable);
    const count    = await this.repo.selectCount({ criteria: selector.criteria });
    const result   = await this.repo.selectMany(selector);
    const data     = result || [];
    const page     = { limit: selector.limit, offset: selector.offset, count: count || 0 };
    res.json({ data, page });
  }

  async select(req: Request, res: Response): Promise<void> {
    const id      = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const columns = convertRequestQueryToDbColumns(req.query, this.columnNamesSelectable);
    const data = await this.repo.select({
      columns,
      criteria: [{ k: this.repo.idColumn, v: id }],
    });
    res.json({ data });
  }

  async insert(req: Request, res: Response): Promise<void> {
    const row  = convertHttpRequestBodyToRow<TRow>(req.body, this.columnNamesCreatable);
    const data = await this.repo.insert(row);
    res.json({ data });
  }

  async update(req: Request, res: Response): Promise<void> {
    const id   = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const row  = convertHttpRequestBodyToRow<TRow>(req.body, this.columnNamesUpdatable);
    const data = await this.repo.update(id, row);
    res.json({ data });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id   = extractIdFromHttpPathParams(req.params, this.idParamPlaceHolder);
    const data = await this.repo.delete(id);
    res.json({ data });
  }
}
