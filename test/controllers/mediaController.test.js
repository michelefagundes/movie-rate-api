const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');

describe('Media Controller', () => {
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

  it('should add a media', async () => {
    const res = await request(app)
      .post('/medias')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Matrix', genre: 'Sci-Fi', releaseDate: '1999-03-31', type: 'movie' });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('title', 'Matrix');
  });

  it('should allow user to review a media', async () => {
    await request(app)
      .post('/medias')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Matrix', genre: 'Sci-Fi', releaseDate: '1999-03-31', type: 'movie' });
    const res = await request(app)
      .post('/medias/1/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Great!' });
    expect(res.status).to.equal(201);
    expect(res.body.reviews[0]).to.have.property('user', 'michele');
  });

  it('should not allow duplicate review by same user', async () => {
    await request(app)
      .post('/medias')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Matrix', genre: 'Sci-Fi', releaseDate: '1999-03-31', type: 'movie' });
    await request(app)
      .post('/medias/1/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Great!' });
    const res = await request(app)
      .post('/medias/1/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Second review!' });
    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal('You already reviewed this movie');
  });
});
