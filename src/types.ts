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

  // idColumn    : string;
  // createdAtColumn: string;
  // updatedAtColumn: string;

  columnNamesSelectable: string[];
  columnNamesCreatable : string[];
  columnNamesUpdatable : string[];

  LIMIT_DEFAULT: number;
  LIMIT_MAX    : number;

  rwTable(): Knex.QueryBuilder<TRow>;
  // roTable(): Knex.QueryBuilder<TRow>;

  // NOTE side-effect: modifies qry
  whereAdapter(qry: Knex.QueryBuilder, criteria?: IDbCriterion[]): void;

  selectCount(options: ISelectCountOptions)   : Promise<number>;
  selectMany(options: ISelectManyOptions)     : Promise<Array<TRow>>;
  selectOne(options: ISelectOneOptions)       : Promise<TRow | null>;
  insertOne(newRow: Partial<TRow>)            : Promise<IdType | null>;
  updateOne(id: IdType, change: Partial<TRow>): Promise<number>;
  deleteOne(id: IdType)                       : Promise<number>;
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
// export type IDbOpExt = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'nin' | 'notin' | 'nil' | 'nnil';
// export type IDbOpSign = '=' | '!=' | '<>' | '>' | '>=' | '<' | '<=';
export type IDbOp = IDbOp$; // | IDbOpExt | IDbOpSign;
export type IDbVal = string | number | boolean | null | Date;

export type IdType = string;

export interface IDbDto extends Record<string, any> {
  id: IdType;
}

export type IPartialRowWithId<TRow extends {} = any> = Partial<TRow> & {
  id: string;
};

export type IPartialRowWithUpdate<TRow extends {} = any> = Partial<TRow> & {
  updatedAtUtc: Date;
};

export type IPartialRowExtended<TRow extends {} = any> = Partial<TRow> & {
  id          : string;
  createdAtUtc: Date;
  updatedAtUtc: Date;
}
