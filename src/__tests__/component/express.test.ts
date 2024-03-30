import express from 'express';
import request from 'supertest';
import { expect } from 'chai';

describe('RequestRejector', () => {

  it('should be able to create an instance and create middleware that rejects requests', (done) => {
    const app = express();

    // TODO: 

    request(app)
      .get('/')
      .expect(500)
      .end(function(err, res) {
        if (err) throw err;
        expect('error' in res.body).to.be.true;
        // { error: 'server is busy' }
        done();
      });
  });

  it('should be able to create an instance and create middleware that does not reject requests', (done) => {
    const app = express();

    app.get('/', (_req, res) => res.json({ ok: true }));

    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        expect('error' in res.body).to.be.false;
        done();
      });
  });

});
