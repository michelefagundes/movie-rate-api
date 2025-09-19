const { expect } = require('chai');
const request = require('supertest');
const { users } = require('../../src/model/userModel');
const { medias } = require('../../src/model/mediaModel');
let token;

describe('Media Service', () => {

  describe('POST /medias/:id/review', () => {
  let mediaId;
  beforeEach(async () => {
      users.length = 0;
      medias.length = 0;
      const app = require('../../src/app');
      await request(app)
        .post('/users/register')
        .send({ username: 'michele', password: '123456' });
      const responseLogin = await request(app)
        .post('/users/login')
        .send({ username: 'michele', password: '123456' });
      token = responseLogin.body.token;
      const mediaResponse = await request(app)
        .post('/medias')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'The Lord of the Rings-' + Math.random(),
          genre: 'Fantasy',
          releaseDate: '2001-12-19',
          type: 'movie'
        });
      mediaId = mediaResponse.body.id;
    });
    });
  });



