const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const { users } = require('../../src/model/userModel');

describe('Auth Controller', () => {
    let token;
    let mediaId;

    beforeEach(async () => {
        users.length = 0;
        const { medias } = require('../../src/model/mediaModel');
        medias.length = 0;
        await request(app)
            .post('/users/register')
            .send({
                username: 'michele',
                password: '123456'
            });
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                username: 'michele',
                password: '123456'
            });
        token = loginResponse.body.token;
        const mediaResponse = await request(app)
            .post('/medias')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'The Lord of the Rings',
                genre: 'Fantasy',
                releaseDate: '2001-12-19',
                type: 'movie'
            });
        mediaId = mediaResponse.body.id;
    });

    it('should allow authenticated user to review a media', (done) => {
        request(app)
            .post(`/medias/${mediaId}/review`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                rating: 5,
                comment: 'Great media!'
            })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.reviews[0]).to.have.property('user', 'michele');
                done();
            });
    });

    it('should not allow unauthenticated user to review a media', (done) => {
        request(app)
            .post(`/medias/${mediaId}/review`)
            .send({
                user: 'michele',
                rating: 5,
                comment: 'Great media!'
            })
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('No token, authorization denied');
                done();
            });
    });
});