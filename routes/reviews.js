const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { sequelize } = require('../config/database');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a specific movie
router.get('/movie/:movieId', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { movieId: req.params.movieId },
      include: [{
        model: User,
        attributes: ['id', 'username']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Get reviews by a specific user
router.get('/user/:userId', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Users can only see their own reviews unless admin (simplified for student project)
    if (req.user.id !== parseInt(req.params.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { userId: req.params.userId },
      include: [{
        model: Movie,
        attributes: ['id', 'title', 'genre', 'releaseDate']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Error fetching user reviews' });
  }
});

// Create a review (protected)
router.post('/', authenticateToken, [
  body('movieId').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const { movieId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if movie exists
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      where: { userId, movieId }
    });

    if (existingReview) {
      await transaction.rollback();
      return res.status(400).json({ error: 'You have already reviewed this movie' });
    }

    // Create the review
    const review = await Review.create({
      userId,
      movieId,
      rating,
      comment
    }, { transaction });

    // Update movie's average rating and total reviews
    await updateMovieRating(movieId, transaction);

    await transaction.commit();

    // Fetch the review with user info for response
    const createdReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        attributes: ['id', 'username']
      }, {
        model: Movie,
        attributes: ['id', 'title']
      }]
    });

    res.status(201).json(createdReview);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Error creating review' });
  }
});

// Update a review (protected)
router.put('/:id', authenticateToken, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findByPk(req.params.id);
    if (!review) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Access denied' });
    }

    await review.update(req.body, { transaction });

    // Update movie's average rating if rating changed
    if (req.body.rating !== undefined) {
      await updateMovieRating(review.movieId, transaction);
    }

    await transaction.commit();

    // Fetch updated review with user info
    const updatedReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        attributes: ['id', 'username']
      }, {
        model: Movie,
        attributes: ['id', 'title']
      }]
    });

    res.json(updatedReview);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Error updating review' });
  }
});

// Delete a review (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Access denied' });
    }

    const movieId = review.movieId;
    await review.destroy({ transaction });

    // Update movie's average rating and total reviews
    await updateMovieRating(movieId, transaction);

    await transaction.commit();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Error deleting review' });
  }
});

// Helper function to update movie rating
async function updateMovieRating(movieId, transaction) {
  const reviews = await Review.findAll({
    where: { movieId },
    attributes: ['rating'],
    transaction
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  await Movie.update({
    averageRating: parseFloat(averageRating.toFixed(2)),
    totalReviews
  }, {
    where: { id: movieId },
    transaction
  });
}

module.exports = router;