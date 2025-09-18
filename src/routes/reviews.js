import express from 'express';
import Review from '../models/Review.js';
import Media from '../models/Movie.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create review (prevent duplicate)
router.post('/', auth, async (req, res) => {
  const { movie, rating, comment } = req.body;
  try {
    const existing = await Review.findOne({ user: req.user.id, movie });
    if (existing) return res.status(400).json({ message: 'You already reviewed this movie' });
    const review = new Review({ user: req.user.id, movie, rating, comment });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error creating review' });
  }
});

// Get all reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId }).populate('user', 'username');
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching reviews' });
  }
});

// Get user's reviews
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id }).populate('movie', 'title');
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching reviews' });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error updating review' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting review' });
  }
});

export default router;
