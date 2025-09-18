const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all movies with search and filter
router.get('/', [
  query('genre').optional().trim(),
  query('releaseYear').optional().isInt({ min: 1900, max: new Date().getFullYear() + 5 }),
  query('minRating').optional().isFloat({ min: 0, max: 5 }),
  query('maxRating').optional().isFloat({ min: 0, max: 5 }),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { genre, releaseYear, minRating, maxRating, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    if (genre) {
      whereConditions.genre = { [Op.like]: `%${genre}%` };
    }

    if (releaseYear) {
      whereConditions.releaseDate = {
        [Op.between]: [`${releaseYear}-01-01`, `${releaseYear}-12-31`]
      };
    }

    if (minRating !== undefined || maxRating !== undefined) {
      whereConditions.averageRating = {};
      if (minRating !== undefined) {
        whereConditions.averageRating[Op.gte] = minRating;
      }
      if (maxRating !== undefined) {
        whereConditions.averageRating[Op.lte] = maxRating;
      }
    }

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { director: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: movies } = await Movie.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: [['averageRating', 'DESC'], ['title', 'ASC']]
    });

    res.json({
      movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Error fetching movies' });
  }
});

// Get single movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: [{
        model: Review,
        include: [{
          model: User,
          attributes: ['id', 'username']
        }]
      }]
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Error fetching movie' });
  }
});

// Create movie (protected)
router.post('/', authenticateToken, [
  body('title').notEmpty().trim().isLength({ max: 200 }),
  body('description').optional().trim(),
  body('genre').notEmpty().trim(),
  body('releaseDate').isISO8601().toDate(),
  body('director').optional().trim(),
  body('duration').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ error: 'Error creating movie' });
  }
});

// Update movie (protected)
router.put('/:id', authenticateToken, [
  body('title').optional().notEmpty().trim().isLength({ max: 200 }),
  body('description').optional().trim(),
  body('genre').optional().notEmpty().trim(),
  body('releaseDate').optional().isISO8601().toDate(),
  body('director').optional().trim(),
  body('duration').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    await movie.update(req.body);
    res.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Error updating movie' });
  }
});

// Delete movie (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    await movie.destroy();
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Error deleting movie' });
  }
});

module.exports = router;