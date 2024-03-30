# express-ajv-knex

tools (using express, ajv, knex) to work with OpenAPI (JSON Schemas) and create simple RESTful resources for SQL databases

## requirements

* Node v18.16.0+

## usage

```sh
npm i @xplora-uk/express-ajv-knex
```

Shorter version:

```typescript
import express from 'express';
import { validatorForExpressApp, controllerForExpressApp } from '@xplora-uk/express-ajv-knex';

const app = express();
const logger = makeLogger();
validatorForExpressApp(app, { openApiSpecFilePath: './openapi.yaml' }, logger);
controllerForExpressApp(app, { tableName: 'SomeEntity' }, logger)
//controllerForExpressApp(app, { tableName: 'SomeEntity', path: '/some-entity' }, logger)
```

## maintenance

### installation

```sh
npm i
```

### code

```plain
src/
  __tests__/
    component/
      express.test.ts          component tests for express middleware
      RequestRejector.test.ts  component tests for RequestRejector
    unit/
      MemoryTracker.test.ts    unit tests for MemoryTracker
  index.ts                     main file that exports features of this library
  express.ts                   file for express middleware - shortcut
  MemoryTracker.ts             MemoryTracker can give info about heap memory
  RequestRejector              RequestRejector uses MemoryTracker and creates an express middleware
```

### build

```sh
npm run build
```

### tests

You can run tests with/without coverage info.

```sh
npm run test:unit
npm run test:component
npm run test:coverage
```

### publish

It is important to increment version number using semantic versioning in `package.json` and re-create `package-lock.json`

```sh
# https://docs.npmjs.com/cli/v9/commands/npm-login
# using a member in xplora-uk
npm login

# https://docs.npmjs.com/cli/v9/commands/npm-publish
npm publish --access public
```