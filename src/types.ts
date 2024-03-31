import { Knex } from 'knex';

export interface IBasicDbService {
  name: string;
  dbRw: Knex;
  dbRo: Knex;
  repo<TRow extends {} = any>(tableName: string, onCreate: IBasicDbRepo<TRow>): IBasicDbRepo<TRow>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface IBasicDbRepo<TRow extends {} = any> {
  db         : IBasicDbService;
  tableName  : string;
  columnNames: string[];

  columnNamesNoSelect: string[];
  columnNamesNoCreate: string[];
  columnNamesNoUpdate: string[];

  idColumn       : string;
  createdAtColumn: string;
  updatedAtColumn: string;

  columnNamesSelectable(): string[];
  columnNamesCreatable() : string[];
  columnNamesUpdatable() : string[];

  rwTable(): Knex.QueryBuilder<TRow>;
  roTable(): Knex.QueryBuilder<TRow>;

  whereAdapter(criteria?: IDbCriterion[]): Knex.QueryCallback;

  selectCount(options: ISelectCountOptions): Promise<number>;
  selectMany(options: ISelectManyOptions)  : Promise<Array<Partial<TRow>>>;
  select(options: ISelectOneOptions)       : Promise<Partial<TRow | null>>;
  insert(data: Partial<TRow>)              : Promise<Partial<TRow>>;
  update(id: IdType, data: Partial<TRow>)  : Promise<number>;
  delete(id: IdType)                       : Promise<number>;
}

export interface ISharedSelectOptions {
  /**
   * list of column names to select, default is '*'
   */
  columns ?: string[];
  criteria?: IDbCriterion[];
  limit   ?: number;
  offset  ?: number;
  orderBy ?: string;
  orderDir?: IDbOrderDir;
}

export type ISelectOneOptions = ISharedSelectOptions;
export type ISelectManyOptions = ISharedSelectOptions;
export type ISelectCountOptions = Pick<ISharedSelectOptions, 'criteria'>;

export interface IDbResultPaginated<TRow extends {} = any> {
  data: TRow[];
  page: {
    count : number;
    limit : number;
    offset: number;
  };
}

export interface IDbCriterion {
  /**
   * key or column name
   */
  k: string;
  /**
   * default operation is '$eq'
   */
  o?: IDbOp;
  /**
   * value
   */
  v?: IDbVal;
  /**
   * values
   */
  vlist?: IDbVal[];
}

export type IDbOrderDir = 'asc' | 'desc';

export type IDbOp$ = '$eq' | '$neq' | '$gt' | '$gte' | '$lt' | '$lte' | '$like' | '$ilike' | '$in' | '$nin' | '$notin' | '$nil' | '$nnil';
export type IDbOpExt = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'nin' | 'notin' | 'nil' | 'nnil';
export type IDbOpSign = '=' | '!=' | '<>' | '>' | '>=' | '<' | '<=';
export type IDbOp = IDbOp$ | IDbOpExt | IDbOpSign;
export type IDbVal = string | number | boolean | null | Date;

export type IdType = string | number;
// export type IDbDtoScalar = string | number | boolean | null | unknown; // unknown is for JSON fields
// export type IDbDto = Record<string, IDbDtoScalar>;
export interface IDbDto extends Record<string, any> {
  id: IdType;
}
