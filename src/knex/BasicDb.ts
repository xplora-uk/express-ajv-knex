import { ILogger } from '@xplora-uk/logger';
import { Knex } from 'knex';

import { IBasicDbRepo, IBasicDbService } from '../types';

export class BasicDb implements IBasicDbService {
  name = 'BasicDb';
  protected _repoCache = new Map<string, IBasicDbRepo<any>>();
  constructor(
    protected _dbRw: Knex,
    protected _dbRo: Knex,
    protected logger: ILogger,
  ) {
    
  }

  dbRw() {
    return this._dbRw;
  }

  dbRo() {
    return this._dbRo;
  }

  repo<TRow extends {} = any>(
    tableName: string,
    onCreate: IBasicDbRepo<TRow>,
  ): IBasicDbRepo<TRow> {
    if (!this._repoCache.has(tableName)) {
      this._repoCache.set(tableName, onCreate);
    }
    return this._repoCache.get(tableName) as IBasicDbRepo<TRow>; // pretending but it's ok
  }

  async start() {
    const result = await this._dbRw.raw('SELECT 1+1 AS result');
    this.logger.info({ msg: this.name + '.start rw db', data: result });

    const result2 = await this._dbRo.raw('SELECT 1+1 AS result');
    this.logger.info({ msg: this.name + '.start ro db', data: result2 });
  }

  async stop() {
    await this._dbRw.destroy();
    await this._dbRo.destroy();
  }
}
