import { Request } from 'express';
import { IDbOrderDir, ISharedSelectOptions } from '../types';

export function convertRequestQueryToDbColumns(query: Request['query'], columnNames: string[]): string[] {
  const { columns = [] } = query;

  let _columns: string[] = [];
  if (Array.isArray(columns)) {
    _columns = columns.map(String).filter(c => columnNames.includes(c));
  }

  return _columns;
}

export function convertRequestQueryToDbSelector(query: Request['query'], columnNames: string[]): ISharedSelectOptions {
  // TODO: we need to transform criteria from query params
  let { criteria = [], orderBy = 'id', orderDir = 'asc', limit = '1000', offset = '0' } = query;

  const _columns = convertRequestQueryToDbColumns(query, columnNames);

  let _orderBy: string = 'id';
  if (typeof orderBy === 'string') _orderBy = String(orderBy);

  let _orderDir: IDbOrderDir = 'asc';
  if (typeof orderDir === 'string' && ['asc', 'desc'].includes(orderDir)) _orderDir = orderDir as IDbOrderDir;

  let _limit = Number.parseInt(String(limit), 10);
  if (Number.isNaN(_limit) || _limit > 1000) _limit = 1000;

  let _offset = Number.parseInt(String(offset), 10);
  if (Number.isNaN(offset) || _offset < 0) _offset = 1000;

  return {
    columns : _columns,
    criteria: criteria as any,
    orderBy : _orderBy,
    orderDir: _orderDir,
    limit   : _limit,
    offset  : _offset,
  };
}

export function extractIdFromHttpPathParams(params: Request['params'], placeHolder = 'id'): string {
  return String(params[placeHolder] || '');
}

export function convertHttpRequestBodyToRow<TRow extends {} = any>(
  body: Request['body'],
  columnNames: string[],
): TRow {
  const row: Record<string, any> = {};

  for (const key of columnNames) {
    if (key in body) {
      row[key] = body[key];
    }
  }

  return row as TRow; // pretending but it's ok
}
