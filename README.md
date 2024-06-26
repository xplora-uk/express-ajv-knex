# express-ajv-knex

tools (using express, ajv, knex) to work with OpenAPI (JSON Schemas) and create simple RESTful resources for SQL databases

## requirements

* Node v18.16.0+

## usage

```sh
npm i @xplora-uk/express-ajv-knex
```

See `./example/src`

## maintenance

### installation

```sh
npm i
```

### code

```plain
src/
  __tests__/
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
