const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');

describe('Review External', () => {
  let token;
  let mediaId;
  beforeEach(async () => {
    require('../../src/model/userModel').users.length = 0;
    require('../../src/model/mediaModel').medias.length = 0;
    await request(app)
      .post('/users/register')
      .send({ username: 'reviewuser', password: '123456' });
    const loginRes = await request(app)
      .post('/users/login')
      .send({ username: 'reviewuser', password: '123456' });
    token = loginRes.body.token;
    const mediaRes = await request(app)
      .post('/medias')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'ReviewMedia-' + Math.random(),
        genre: 'Adventure',
        releaseDate: '2022-01-01',
        type: 'movie'
      });
    mediaId = mediaRes.body.id;
  });


    it('should not allow duplicate media titles', async () => {
      await request(app)
        .post('/users/register')
        .send({ username: 'test.user', password: '123456' });
      const loginRes = await request(app)
        .post('/users/login')
        .send({ username: 'test.user', password: '123456' });
      const userToken = loginRes.body.token;

      await request(app)
        .post('/medias')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Soul',
          genre: 'Drama',
          releaseDate: '2020-10-11',
          type: 'movie'
        });
      const secondReview = await request(app)
        .post('/medias')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Soul',
          genre: 'Drama',
          releaseDate: '2020-10-11',
          type: 'movie'
        });
      expect(secondReview.status).to.equal(400);
      expect(secondReview.body.message).to.equal('Media with this title already exists');
    });
});
