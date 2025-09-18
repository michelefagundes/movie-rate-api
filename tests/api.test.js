const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/database');

// Test database setup
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('API Routes', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Movie Rate API');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('Authentication', () => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should not register user with same email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('Movies', () => {
    let authToken;
    let movieId;

    beforeAll(async () => {
      // Create a user and get token
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'movieuser',
          email: 'movie@example.com',
          password: 'password123'
        });
      authToken = userResponse.body.token;
    });

    it('should create a movie', async () => {
      const movieData = {
        title: 'Test Movie',
        description: 'A test movie',
        genre: 'Action',
        releaseDate: '2023-01-01',
        director: 'Test Director',
        duration: 120
      };

      const response = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movieData);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(movieData.title);
      movieId = response.body.id;
    });

    it('should get all movies', async () => {
      const response = await request(app).get('/api/movies');
      
      expect(response.status).toBe(200);
      expect(response.body.movies).toBeDefined();
      expect(Array.isArray(response.body.movies)).toBe(true);
    });

    it('should get movie by id', async () => {
      const response = await request(app).get(`/api/movies/${movieId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(movieId);
    });

    it('should search movies', async () => {
      const response = await request(app)
        .get('/api/movies')
        .query({ search: 'Test' });
      
      expect(response.status).toBe(200);
      expect(response.body.movies.length).toBeGreaterThan(0);
    });
  });

  describe('Reviews', () => {
    let authToken;
    let movieId;
    let reviewId;

    beforeAll(async () => {
      // Create user and movie for testing
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'reviewuser',
          email: 'review@example.com',
          password: 'password123'
        });
      authToken = userResponse.body.token;

      const movieResponse = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Review Test Movie',
          genre: 'Drama',
          releaseDate: '2023-01-01'
        });
      movieId = movieResponse.body.id;
    });

    it('should create a review', async () => {
      const reviewData = {
        movieId,
        rating: 4,
        comment: 'Great movie!'
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData);
      
      expect(response.status).toBe(201);
      expect(response.body.rating).toBe(reviewData.rating);
      expect(response.body.comment).toBe(reviewData.comment);
      reviewId = response.body.id;
    });

    it('should prevent duplicate reviews', async () => {
      const reviewData = {
        movieId,
        rating: 3,
        comment: 'Another review'
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already reviewed');
    });

    it('should get reviews for movie', async () => {
      const response = await request(app)
        .get(`/api/reviews/movie/${movieId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.reviews).toBeDefined();
      expect(response.body.reviews.length).toBeGreaterThan(0);
    });

    it('should update review', async () => {
      const updateData = {
        rating: 5,
        comment: 'Updated comment'
      };

      const response = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(updateData.rating);
      expect(response.body.comment).toBe(updateData.comment);
    });
  });
});