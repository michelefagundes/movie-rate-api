import { expect } from "chai";
import { response } from "express";
import { describe, it } from "mocha";

describe('Auth Controller', () => {
    let token;
    beforeEach(async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                username: 'michele',
                password: '123456'
            });
        token = loginResponse.body.token;
    });

    it('should allow authenticated user to review a media', () => {
        return request(app)
            .post('/media/1/review')
            .set('Authorization', `Bearer ${token}`)
            .send({
                rating: 5,
                comment: 'Great movie!'
            })
            .expect(201);
            expect(response.body.message).to.equal('No token, authorization denied');
            });
    });

    it('should not allow unauthenticated user to review a media', () => {
        return request(app)
            .post('/media/1/review')
            .send({
                rating: 5,
                comment: 'Great movie!'
            })
            .expect(401);
            expect(response.body.message).to.equal('No token, authorization denied');
    });
