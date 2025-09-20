import express from 'express';
const { reviews } = require('../model/reviewModel');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, (req, res) => {
  const { movie, rating, comment } = req.body;
  try {
    const existing = reviews.find(r => r.user === req.user.id && r.movie === movie);
    if (existing) return res.status(400).json({ message: 'You already reviewed this movie' });
    const review = { id: reviews.length + 1, user: req.user.id, movie, rating, comment };
    reviews.push(review);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error creating review' });
  }
});

router.get('/movie/:movieId', (req, res) => {
  try {
    const movieReviews = reviews.filter(r => r.movie === Number(req.params.movieId));
    res.json(movieReviews);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching reviews' });
  }
});

router.get('/user', auth, (req, res) => {
  try {
    const userReviews = reviews.filter(r => r.user === req.user.id);
    res.json(userReviews);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching reviews' });
  }
});

router.put('/:id', auth, (req, res) => {
  try {
    const review = reviews.find(r => r.id === Number(req.params.id) && r.user === req.user.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    Object.assign(review, req.body);
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error updating review' });
  }
});

router.delete('/:id', auth, (req, res) => {
  try {
    const idx = reviews.findIndex(r => r.id === Number(req.params.id) && r.user === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'Review not found' });
    reviews.splice(idx, 1);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting review' });
  }
});

export default router;
