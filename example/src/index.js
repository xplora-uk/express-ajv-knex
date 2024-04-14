const { newLogger } = require('@xplora-uk/logger');
const express = require('express');
const knex = require('knex');

const { errorHandlerForExpressApp, useControllerForExpressApp, BasicDb } = require('../../lib');

const { initUsers } = require('./users');
const { initPets } = require('./pets');
const { runTests } = require('./tests');

main();

async function main() {
  const app = express();

  app.use(express.json());

  app.get('/', (_req, res) => { res.json({ data: 'Hi' }) });

  const logger = newLogger({ kind: 'console', level: 'debug', app: { app_name: 'test', app_version: '1.0.0', env: 'test' }});

  const dbRw = knex({ client: 'sqlite3', connection: { filename: ':memory:' }, useNullAsDefault: true});
  const dbRo = dbRw;

  const db = new BasicDb(dbRw, dbRo, logger);

  const { userRepo, userController } = await initUsers(db, logger);
  const { petController } = await initPets(db, logger);

  // TODO: use express-openapi-validator
  // app.use(
  //   OpenApiValidator.middleware({
  //     apiSpec: __dirname + '/../pet-store.yaml',
  //     validateRequests: true,
  //     validateResponses: false,
  //   }),
  // );

  // make a route for user - short-cut
  useControllerForExpressApp({
    app,
    options: { tableName: 'User', path: '/user' },
    db,
    logger,
    repo: userRepo,
    controller: userController,
  });

  // attach pet controller manually
  app.post  ('/pet',        petController.insertOne);
  app.put   ('/pet',        petController.updateOne); // TODO: this one is tricky!!
  app.get   ('/pet/:petId', petController.selectOne);
  app.delete('/pet/:petId', petController.deleteOne);

  app.use(errorHandlerForExpressApp(logger));

  const server = app.listen(3000, async () => {
    console.log('Server started on http://localhost:3000');
    await runTests();

    console.log('Closing...');
    server.close(async () => {
      await dbRw.destroy();
      process.exit(0);
    });
  });
}
