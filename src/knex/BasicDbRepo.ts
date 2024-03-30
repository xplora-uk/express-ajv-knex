import { IBasicDbService, IBasicDbRepo, IdType, ISelectOneOptions, ISelectManyOptions } from '../types';

export class BasicDbRepo<TRow extends {} = any> implements IBasicDbRepo<TRow> {
  
  constructor(
    public db: IBasicDbService,
    public tableName: string,
  ) {
    // do nothing
  }

  _rwTable() {
    return this.db.dbRw()(this.tableName);
  }

  async selectMany(options: ISelectManyOptions) {
    let { columns = '*', criteria = {}, orderBy = 'id', orderDir = 'asc', limit = 1000, offset = 0 } = options;
    if (limit > 1000) limit = 1000;
    if (offset < 0) offset = 0;

    const rowCounter = await this.db.dbRo()
      .count('* as count')
      .from<{ count: number; }>(this.tableName)
      .where(criteria)
      .first();

    const data = await this.db.dbRo()
      .select(columns)
      .from<Partial<TRow>>(this.tableName)
      .where(criteria)
      .orderBy(orderBy, orderDir)
      .limit(limit)
      .offset(offset);

    return { data, page: { limit, offset, total: rowCounter.count || 0 }};
  }

  select(options: ISelectOneOptions) {
    const { columns = '*', criteria = {}, orderBy = 'id', orderDir = 'asc' } = options;
    return this.db.dbRo()
      .select(columns)
      .from<Partial<TRow>>(this.tableName)
      .where(criteria)
      .orderBy(orderBy, orderDir)
      .first();
  }

  insert(data: Partial<TRow>) {
    return this._rwTable().insert(data);
  }

  update(id: IdType, data: Partial<TRow>) {
    return this._rwTable().where({ id }).update(data);
  }

  delete(id: IdType) {
    return this._rwTable().where({ id }).del();
  }
}
