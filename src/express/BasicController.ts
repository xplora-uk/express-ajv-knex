import { ILogger } from '@xplora-uk/logger';
import { Request, Response } from 'express';

import { BasicDbRepo } from '../knex/BasicDbRepo';
import { IResourceController } from './types';

export class BasicController<TRow extends {} = any> implements IResourceController<TRow> {
  name = 'BasicController';
  constructor(
    public repo: BasicDbRepo<TRow>,
    public logger: ILogger,
  ) {
    this.insert     = this.insert.bind(this);
    this.selectMany = this.selectMany.bind(this);
    this.select     = this.select.bind(this);
    this.update     = this.update.bind(this);
    this.delete     = this.delete.bind(this);
  }

  async insert(req: Request, res: Response): Promise<void> {
    const result = await this.repo.insert(req.body);
    res.json(result);
  }

  async selectMany(req: Request, res: Response): Promise<void> {
    const result = await this.repo.selectMany(req.query);
    res.json(result);
  }

  async select(req: Request, res: Response): Promise<void> {
    const data = await this.repo.select({ criteria: { id: req.params.id }});
    res.json({ data });
  }

  async update(req: Request, res: Response): Promise<void> {
    const data = await this.repo.update(req.params.id, req.body);
    res.json({ data });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const data = await this.repo.delete(req.params.id);
    res.json({ data });
  }
}