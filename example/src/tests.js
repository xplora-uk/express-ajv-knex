const axios = require('axios');
const assert = require('assert');

async function runTests() {
  const request = axios.create({ baseURL: 'http://localhost:3000' });

  console.info('GET /');
  const res1 = await request.get('/');
  console.info('result', res1.status, res1.data);
  assert.equal(res1.status, 200);
  assert.equal('data' in res1.data, true);

  console.info('POST /pet');
  const res2 = await request.post('/pet', { name: 'Silly', photoUrls: ['http://example.com/img1.jpg' ] });
  console.info('result', res2.status, res2.data);
  assert.equal(res2.status, 200);
  

  // TODO: run update

  console.info('GET /pet/:petId');
  const res4 = await request.get('/pet/' + res2.data.data.id);
  console.info('result', res4.status, res4.data);
  assert.equal(res4.status, 200);

  console.info('DELETE /pet/:petId');
  const res5 = await request.delete('/pet/' + res2.data.data.id)
  console.info('result', res5.status, res5.data);
  assert.equal(res5.status, 200);
}

module.exports = { runTests };
