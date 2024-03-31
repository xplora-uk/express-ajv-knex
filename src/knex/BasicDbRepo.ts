import knex from 'knex';
import { IBasicDbService, IBasicDbRepo, IdType, ISelectOneOptions, ISelectManyOptions, ISelectCountOptions, IDbResultPaginated, IDbCriterion } from '../types';
import { filterColumnNames } from '../utils/array';

export class BasicDbRepo<TRow extends {} = any> implements IBasicDbRepo<TRow> {
  public idColumn                      = 'id';
  public createdAtColumn               = '';
  public updatedAtColumn               = '';

  public columnNames: string[]         = ['id'];
  public columnNamesNoSelect: string[] = [];
  public columnNamesNoCreate: string[] = [];
  public columnNamesNoUpdate: string[] = [];

  constructor(public db: IBasicDbService, public tableName: string) {
    // do nothing
  }

  columnNamesSelectable() {
    return filterColumnNames(this.columnNames, this.columnNamesNoSelect);
  }

  columnNamesCreatable() {
    return filterColumnNames(this.columnNames, this.columnNamesNoCreate);
  }

  columnNamesUpdatable() {
    return filterColumnNames(this.columnNames, this.columnNamesNoUpdate);
  }

  rwTable() {
    return this.db.dbRw(this.tableName);
  }

  whereAdapter(criteria: IDbCriterion[] = []) {

    const cb: knex.Knex.QueryCallback = (qry) => {
      // for each key in criteria, add a where clause
      for (const { k: key, o: op = '=', v: val = null, vlist = [] } of criteria) {
        switch (op) {
          case '=':
          case 'eq':
          case '$eq':
            qry.where(key, val); break;

          case '<>':
          case 'neq':
          case '$neq':
            qry.whereNot(key, val); break;

          case 'nil':
          case '$nil':
            qry.whereNull(key); break;

          case 'nnil':
          case '$nnil':
            qry.whereNotNull(key); break;

          case 'like':
          case '$like':
            qry.whereLike(key, val); break;

          case 'ilike':
          case '$ilike':
            qry.whereILike(key, val); break;

          case 'ilike':
          case '$ilike':
            qry.whereILike(key, val); break;

          case 'in':
          case '$in':
            qry.whereIn(key, vlist); break;

          case 'nin':
          case 'notin':
          case '$nin':
          case '$notin':
            qry.whereNotIn(key, vlist); break;

          case '>':
          case 'gt':
          case '$gt':
            qry.where(key, '>', val); break;

          case '>=':
          case 'gte':
          case '$gte':
            qry.where(key, '>=', val); break;

          case '<':
          case 'lt':
          case '$lt':
            qry.where(key, '<', val); break;

          case '<=':
          case 'lte':
          case '$lte':
            qry.where(key, '<=', val); break;
        }
      }
    }

    return cb;
  }

  async selectCount(options: ISelectCountOptions): Promise<number> {
    let { criteria = [] } = options;

    const rowCounter = await this.db.dbRo()
      .count('* as count')
      .from<{ count: number; }>(this.tableName)
      .where(this.whereAdapter(criteria))
      .first();

    const c = Number.parseInt(String(rowCounter?.count || '0'), 10);
    return Number.isNaN(c) ? 0 : c;
  }

  async selectMany(options: ISelectManyOptions): Promise<Array<Partial<TRow>>> {
    let { columns = [], criteria = [], orderBy = this.idColumn, orderDir = 'asc', limit = 1000, offset = 0 } = options;

    if (limit > 1000) limit = 1000;
    if (offset < 0) offset = 0;

    const rows = await this.db.dbRo()
      .select(columns)
      .from<Partial<TRow>>(this.tableName)
      .where(this.whereAdapter(criteria))
      .orderBy(orderBy, orderDir)
      .limit(limit)
      .offset(offset);

    return (rows || []) as Array<Partial<TRow>>; // pretending
  }

  async select(options: ISelectOneOptions): Promise<Partial<TRow | null>> {
    let { columns = [], criteria = {}, orderBy = this.idColumn, orderDir = 'asc' } = options;

    const row = await this.db.dbRo()
      .select(columns)
      .from<Partial<TRow>>(this.tableName)
      .where(criteria)
      .orderBy(orderBy, orderDir)
      .first();

    return row || null;
  }

  async insert(data: Partial<TRow>): Promise<Partial<TRow>> {
    const result = await this.rwTable()
      .insert(data)
      .returning(this.idColumn);
    return result && result.length ? result[0] : {};
  }

  async update(id: IdType, data: Partial<TRow>): Promise<number> {
    const result = await this.rwTable()
      .where(this.idColumn, id)
      .update(data);

    return result;
  }

  async delete(id: IdType): Promise<number> {
    const result = await this.rwTable()
      .where(this.idColumn, id)
      .del();

    return result;
  }
}
