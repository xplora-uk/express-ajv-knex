import { NextFunction, Request, Response } from 'express';
import { makeJsonSchemaValidator } from '../open-api';
import { IResourceOptions } from './types';

export function makeValidatorMiddlewareForExpress(options: IResourceOptions) {
  const {
    openApiSpec,
    tableName,
    schemas = {},
    onValidationErrors,
  } = options;

  const {
    insertOne: schemaToInsert = 'RequestToInsert' + tableName,
    updateOne: schemaToUpdate = 'RequestToUpdate' + tableName,
    selectMany: schemaToSelectMany = 'RequestToSelectMany' + tableName,
  } = schemas;

  const validatorToInsert = makeJsonSchemaValidator(openApiSpec, schemaToInsert);
  const validatorToUpdate = makeJsonSchemaValidator(openApiSpec, schemaToUpdate);
  const validatorToSelectMany = makeJsonSchemaValidator(openApiSpec, schemaToSelectMany);

  const middlewareToInsert = (req: Request, res: Response, next: NextFunction) => {
    const input = req.body || {};
    const valid = validatorToInsert(input);
    if (!valid) {
      res.status(400).json(validatorToInsert.errors);
      if (onValidationErrors) {
        const p = onValidationErrors(validatorToInsert.errors ?? [], schemaToInsert, req);
        if (p instanceof Promise) p.then(() => {}).catch(console.error);
      }
      return;
    }
    next();
  }

  const middlewareToUpdate = (req: Request, res: Response, next: NextFunction) => {
    const input = req.body || {};
    const valid = validatorToUpdate(input);
    if (!valid) {
      res.status(400).json(validatorToUpdate.errors);
      if (onValidationErrors) {
        const p = onValidationErrors(validatorToUpdate.errors ?? [], schemaToUpdate, req);
        if (p instanceof Promise) p.then(() => {}).catch(console.error);
      }
      return;
    }
    next();
  }

  const middlewareToSelectMany = (req: Request, res: Response, next: NextFunction) => {
    const input = req.query || {};
    const valid = validatorToSelectMany(input);
    if (!valid) {
      res.status(400).json(validatorToSelectMany.errors);
      if (onValidationErrors) {
        const p = onValidationErrors(validatorToSelectMany.errors ?? [], schemaToSelectMany, req);
        if (p instanceof Promise) p.then(() => {}).catch(console.error);
      }
      return;
    }
    next();
  }

  return {
    validatorToInsert,
    validatorToUpdate,
    validatorToSelectMany,
    middlewareToInsert,
    middlewareToUpdate,
    middlewareToSelectMany,
  };
}
