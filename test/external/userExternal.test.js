const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');

describe('User External', () => {
  beforeEach(() => {
    require('../../src/model/userModel').users.length = 0;
  });

  it('should register a new user', async () => {
    const user = 'user_' + Date.now();
    const res = await request(app)
      .post('/users/register')
      .send({ username: user, password: '123456' });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('username', user);
  });

  it('should not register duplicate user', async () => {
    await request(app)
      .post('/users/register')
      .send({ username: 'externaluser', password: '123456' });
    const res = await request(app)
      .post('/users/register')
      .send({ username: 'externaluser', password: '123456' });
    expect(res.status).to.equal(400);
  });

  it('should login with valid credentials', async () => {
    await request(app)
      .post('/users/register')
      .send({ username: 'loginuser', password: '123456' });
    const res = await request(app)
      .post('/users/login')
      .send({ username: 'loginuser', password: '123456' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
  });

  it('should not allow unauthenticated user to create media', async () => {
    const res = await request(app)
      .post('/medias')
      .send({
        title: 'Rio',
        genre: 'Animation',
        releaseDate: '2011-04-15',
        type: 'movie'
      });
    expect(res.status).to.equal(401);
  });
});
