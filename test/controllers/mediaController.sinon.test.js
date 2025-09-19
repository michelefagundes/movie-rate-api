const sinon = require('sinon');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const mediaModel = require('../../src/model/mediaModel');

describe('Media Controller (sinon)', () => {
  let token;

  beforeEach(async () => {
    const { users } = require('../../src/model/userModel');
    const { medias } = require('../../src/model/mediaModel');
    users.length = 0;
    medias.length = 0;

    await request(app)
      .post('/users/register')
      .send({ username: 'michele', password: '123456' });
    const loginRes = await request(app)
      .post('/users/login')
      .send({ username: 'michele', password: '123456' });
    token = loginRes.body.token;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all media', async () => {
    const fakeMedia = [
      { id: 1, title: 'Fake Movie', description: 'Test' }
    ];
    sinon.stub(mediaModel, 'getAllMedia').returns(fakeMedia);
    const res = await request(app)
      .get('/medias')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
  });
});
