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
      await request('http://localhost:3000')
        .post('/users/register')
        .send({ username: 'michele', password: '123456' });
      const responseLogin = await request('http://localhost:3000')
        .post('/users/login')
        .send({ username: 'michele', password: '123456' });
      token = responseLogin.body.token;
      const mediaResponse = await request('http://localhost:3000')
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



