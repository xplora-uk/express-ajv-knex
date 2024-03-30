import { Knex } from 'knex';

export type IdType = string;
// export type IDbDtoScalar = string | number | boolean | null | unknown; // unknown is for JSON fields
// export type IDbDto = Record<string, IDbDtoScalar>;
export interface IDbDto extends Record<string, any> {
  id: IdType;
}

export interface IBasicDbService {
  name: string;
  dbRw(): Knex;
  dbRo(): Knex;
  repo<TRow extends {} = any>(tableName: string, onCreate: IBasicDbRepo<TRow>): IBasicDbRepo<TRow>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface IBasicDbRepo<TRow extends {} = any> {
  db                                     : IBasicDbService;
  tableName                              : string;
  _rwTable()                             : Knex.QueryBuilder<TRow>;
  selectMany(options: ISelectManyOptions): Promise<IDbResultPaginated<Partial<TRow>>>;
  select(options: ISelectOneOptions)     : Knex.QueryBuilder<Partial<TRow>>;
  insert(data: Partial<TRow>)            : Knex.QueryBuilder<Partial<TRow>>;
  update(id: IdType, data: Partial<TRow>): Knex.QueryBuilder<Partial<TRow>>;
  delete(id: IdType)                     : Knex.QueryBuilder;
}

export interface ISharedSelectOptions {
  columns ?: string[] | string;
  criteria?: any;
  limit   ?: number;
  offset  ?: number;
  orderBy ?: string;
  orderDir?: 'asc' | 'desc';
}

export type ISelectOneOptions = ISharedSelectOptions;

export interface ISelectManyOptions extends ISharedSelectOptions {

}

export interface IDbResultPaginated<TRow extends {} = any> {
  data: TRow[];
  page: {
    total: number;
    limit: number;
    offset: number;
  };
}
