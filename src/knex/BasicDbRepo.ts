import knex from 'knex';
import { IBasicDbService, IBasicDbRepo, IdType, ISelectOneOptions, ISelectManyOptions, ISelectCountOptions, IDbResultPaginated, IDbCriterion, IPartialRowWithId, IPartialRowExtended } from '../types';
import { filterColumnNames } from '../utils/array';

export class BasicDbRepo<TRow extends {} = any> implements IBasicDbRepo<TRow> {
  // protected idColumn        = 'id';
  // protected createdAtColumn = 'createdAtUtc';
  // protected updatedAtColumn = 'updatedAtUtc';

  public columnNames: string[]         = [];
  public columnNamesNoSelect: string[] = [];
  public columnNamesNoCreate: string[] = ['id', 'createdAtUtc', 'updatedAtUtc'];
  public columnNamesNoUpdate: string[] = ['id', 'createdAtUtc', 'updatedAtUtc'];

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

  whereAdapter(qry: knex.Knex.QueryBuilder, criteria: IDbCriterion[] = []): void {
    for (const criterion of criteria) {
      // add where clauses
      const { k, o = '$eq', v = null, vlist = [] } = criterion;
      switch (o) { // operation
        case '$eq':
          qry.where(k, '=', v); break;
        case '$neq':
          qry.whereNot(k, '<>', v); break;
        case '$gt':
          qry.where(k, '>', v); break;
        case '$gte':
          qry.where(k, '>=', v); break;
        case '$lt':
          qry.where(k, '<', v); break;
        case '$lte':
          qry.where(k, '<=', v); break;
        case '$nil':
          qry.whereNull(k); break;
        case '$nnil':
          qry.whereNotNull(k); break;
        case '$like':
          qry.whereLike(k, v); break;
        case '$ilike':
          qry.whereILike(k, v); break;
        case '$ilike':
          qry.whereILike(k, v); break;
        case '$in':
          qry.whereIn(k, vlist); break;
        case '$nin':
          qry.whereNotIn(k, vlist); break;
      }
    }
  }

  async selectCount(options: ISelectCountOptions): Promise<number> {
    let { criteria = [] } = options;

    const qry = this.db.dbRo<{ count: number; }>(this.tableName);

    this.whereAdapter(qry, criteria);

    const rowCounter = qry.count('* as count').first();

    const c = Number.parseInt(String(rowCounter?.count || '0'), 10);
    return Number.isNaN(c) ? 0 : c;
  }

  async selectMany(options: ISelectManyOptions): Promise<Array<TRow>> {
    let { columns = [], criteria = [], orderBy = 'id', orderDir = 'asc', limit = this.LIMIT_DEFAULT, offset = 0 } = options;

    if (limit > this.LIMIT_MAX) limit = this.LIMIT_MAX;
    if (offset < 0) offset = 0;

    const qry = this.db.dbRo<TRow>(this.tableName);

    this.whereAdapter(qry, criteria);

    const rows = await qry
      .select(columns.length ? columns : '*')
      .orderBy(orderBy, orderDir)
      .limit(limit)
      .offset(offset);

    return (rows || []) as Array<TRow>; // pretending
  }

  async selectOne(options: ISelectOneOptions): Promise<TRow | null> {
    let { columns = [], criteria = [], orderBy = 'id', orderDir = 'asc' } = options;

    const qry = this.db.dbRo<TRow>(this.tableName);

    this.whereAdapter(qry, criteria);

    const row = await qry
      .select(columns.length ? columns : '*')
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
