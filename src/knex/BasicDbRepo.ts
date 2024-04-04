import knex from 'knex';
import { IBasicDbService, IBasicDbRepo, IdType, ISelectOneOptions, ISelectManyOptions, ISelectCountOptions, IDbResultPaginated, IDbCriterion, IPartialRowWithId, IPartialRowExtended } from '../types';
import { filterColumnNames } from '../utils/array';

export class BasicDbRepo<TRow extends {} = any> implements IBasicDbRepo<TRow> {
  // protected idColumn        = 'id';
  // protected createdAtColumn = 'createdAtUtc';
  // protected updatedAtColumn = 'updatedAtUtc';

  public columnNames: string[]         = [];
  public columnNamesNoSelect: string[] = [];
  public columnNamesNoCreate: string[] = [];
  public columnNamesNoUpdate: string[] = [];

  public LIMIT_DEFAULT = 10;
  public LIMIT_MAX     = 100;

  constructor(public db: IBasicDbService, public tableName: string) {
    // do nothing
  }

  get columnNamesSelectable(): string[] {
    return filterColumnNames(this.columnNames, this.columnNamesNoSelect);
  }

  get columnNamesCreatable(): string[] {
    return filterColumnNames(this.columnNames, this.columnNamesNoCreate);
  }

  get columnNamesUpdatable(): string[] {
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

    const rowCounter = await this.db.dbRo
      .count('* as count')
      .from<{ count: number; }>(this.tableName)
      .where(this.whereAdapter(criteria))
      .first();

    const c = Number.parseInt(String(rowCounter?.count || '0'), 10);
    return Number.isNaN(c) ? 0 : c;
  }

  async selectMany(options: ISelectManyOptions): Promise<Array<TRow>> {
    let { columns = [], criteria = [], orderBy = 'id', orderDir = 'asc', limit = this.LIMIT_DEFAULT, offset = 0 } = options;

    if (limit > this.LIMIT_MAX) limit = this.LIMIT_MAX;
    if (offset < 0) offset = 0;

    const rows = await this.db.dbRo
      .select(columns.length ? columns : '*')
      .from<TRow>(this.tableName)
      .where(this.whereAdapter(criteria))
      .orderBy(orderBy, orderDir)
      .limit(limit)
      .offset(offset);

    return (rows || []) as Array<TRow>; // pretending
  }

  async selectOne(options: ISelectOneOptions): Promise<TRow | null> {
    let { criteria = {}, orderBy = 'id', orderDir = 'asc' } = options;

    const row = await this.db.dbRo
      .select('*')
      .from<TRow>(this.tableName)
      .where(criteria)
      .orderBy(orderBy, orderDir)
      .limit(1)
      .offset(0)
      .first();

    return row ? row as TRow : null; // pretending TRow
  }

  async insertOne(newRow: Partial<TRow>): Promise<IdType | null> {
    const result = await this.rwTable()
      .insert(newRow)
      .returning('id');
    return result && result.length ? result[0]['id'] : null;
  }

  async updateOne(id: IdType, data: Partial<TRow>): Promise<number> {
    const result = await this.rwTable()
      .where('id', id)
      .update(data);

    return result;
  }

  async deleteOne(id: IdType): Promise<number> {
    const result = await this.rwTable()
      .where('id', id)
      .del();

    return result;
  }
}
