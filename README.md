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
import * as OpenApiValidator from 'express-openapi-validator';
import { useControllerForExpressApp, errorHandlerForExpressApp } from '@xplora-uk/express-ajv-knex';

const app = express();
const logger = makeLogger();
const db = new Basic
app.use(
  OpenApiValidator.middleware({
    apiSpec: './openapi.yaml',
    validateRequests: true,
    validateResponses: false,
  }),
);

useControllerForExpressApp({ app, options: { tableName: 'SomeEntity' }, db, logger });
// useControllerForExpressApp({ app, options: { tableName: 'SomeEntity', path: '/some-entity' }, logger })

// last middleware
app.use(errorHandlerForExpressApp(logger));
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
    component/            component tests
    unit/                 unit tests
  ajv/                    load ajv lib
  express/                controller and validator for express app
  knex/                   db classes to support controller
  open-api/               use schemas from api spec for json schema validation
  utils/                  utility functions
  index.ts                main file that exports features of this library
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