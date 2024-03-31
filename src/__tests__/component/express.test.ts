import { newLogger } from '@xplora-uk/logger/lib';
import { expect } from 'chai';
import express from 'express';
import knex from 'knex';
import request from 'supertest';

import { controllerForExpressApp, validatorForExpressApp } from '../../express';
import { BasicDb } from '../../knex';
import { initUsers } from './users';
import { initPets } from './pets';

describe('express controllers and validator', async () => {

  it('should be able to create an app and test', async () => {
    const app = express();

    app.use(express.json());

    app.get('/', (_req, res) => { res.json({ data: 'Hi' }) });

    const logger = newLogger({ kind: 'console', level: 'debug', app: { app_name: 'test', app_version: '1.0.0', env: 'test' }});

    const dbRw = knex({ client: 'sqlite3', connection: { filename: ':memory:' }, useNullAsDefault: true});
    const dbRo = dbRw;

    const db = new BasicDb(dbRw, dbRo, logger);

    const { userRepo, userController } = await initUsers(db, logger);
    const { petController }   = await initPets(db, logger);

    validatorForExpressApp(app, { openApiSpecFilePath: __dirname + '/pet-store.yaml' }, logger);
    controllerForExpressApp(app, { tableName: 'User', path: '/user' }, db, logger, userRepo, userController);

    app.post  ('/pet', petController.insert);
    app.put   ('/pet', petController.update); // TODO: this one is tricky!!
    app.get   ('/pet/:petId', petController.select);
    app.delete('/pet/:petId', petController.delete);

    console.info('GET /');
    const res1 = await request(app)
      .get('/')
      .expect(200);
    expect('data' in res1.body).to.be.true;

    console.info('POST /pet');
    const res2 = await request(app)
      .post('/pet')
      .send({ name: 'Silly', photoUrls: ['http://example.com/img1.jpg' ] })
      .expect(200);
    console.info('res2.body:', res2.body);
    expect('data' in res2.body).to.be.true;

    // TODO: run update

    console.info('GET /pet/:petId');
    const res4 = await request(app)
      .get('/pet/' + res2.body.data.id)
      .expect(200);
    console.info('res4.body:', res4.body);
    expect('data' in res4.body).to.be.true;

    console.info('DELETE /pet/:petId');
    const res5 = await request(app)
      .delete('/pet/' + res2.body.data.id)
      .expect(200);
    console.info('res5.body:', res5.body);
    expect('data' in res5.body).to.be.true;
  });

});
