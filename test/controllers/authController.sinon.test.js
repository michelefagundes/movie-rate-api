const sinon = require('sinon');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const userModel = require('../../src/model/userModel');

describe('Auth Controller (sinon)', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should simulate user search', async () => {
    const fakeUsers = [{ username: 'fake', password: '123' }];
    sinon.stub(userModel, 'users').value(fakeUsers);
    const res = await request(app)
      .post('/users/login')
      .send({ username: 'fake', password: '123' });
  expect(res.status).to.equal(400);
  expect(res.body).to.have.property('error');
  });
});
