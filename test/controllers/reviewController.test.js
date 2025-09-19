process.env.JWT_SECRET = 'secretdemo';
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');

describe('Review Controller', () => {
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

  it('should return error for non-existent media when user tries to review a media', async () => {
    await request(app)
      .post('/medias')
      .send({ title: 'The Lord of The Rings', genre: 'Fantasy', releaseDate: '2001-12-19', type: 'movie' });
    const res = await request(app)
      .post('/medias/999/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Great!' });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal('Media not found');
  });

  it('should list all reviews of a media', async () => {
    await request(app)
      .post('/medias')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Movie', genre: 'Action', releaseDate: '2020-01-01', type: 'movie' });
    await request(app)
      .post('/medias/1/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Very good!' });
    const res = await request(app)
      .get('/medias/1/reviews')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('should validate mandatory fields', async () => {
    await request(app)
      .post('/medias')
      .send({ title: 'Movie', genre: 'Action', releaseDate: '2020-01-01', type: 'movie' });
    const res = await request(app)
      .post('/medias/1/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5 });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal('Comment is required');
  });

  });