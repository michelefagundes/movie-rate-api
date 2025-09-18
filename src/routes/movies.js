import express from 'express';
import Media from '../models/Movie.js';

const router = express.Router();

// Create media (movie or serie)
router.post('/', async (req, res) => {
  try {
    const media = new Media(req.body);
    await media.save();
    res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ message: 'Error creating movie or serie' });
  }
});

// Get all medias with filters
router.get('/', async (req, res) => {
  const { genre, releaseDate, minRating, type } = req.query;
  let filter = {};
  if (genre) filter.genre = genre;
  if (releaseDate) filter.releaseDate = { $gte: new Date(releaseDate) };
  if (type) filter.type = type;
  let medias = await Media.find(filter);
  // Optionally filter by average rating
  if (minRating) {
    const Review = (await import('../models/Review.js')).default;
    const mediaIds = [];
    for (const media of medias) {
      const reviews = await Review.find({ movie: media._id });
      if (reviews.length) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        if (avg >= Number(minRating)) mediaIds.push(media._id);
      }
    }
    medias = medias.filter(m => mediaIds.includes(m._id));
  }
  res.json(medias);
});

// Get single media
router.get('/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Movie or serie not found' });
    res.json(media);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching movie or serie' });
  }
});

// Update media
router.put('/:id', async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!media) return res.status(404).json({ message: 'Movie or serie not found' });
    res.json(media);
  } catch (err) {
    res.status(400).json({ message: 'Error updating movie or serie' });
  }
});

// Delete media
router.delete('/:id', async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ message: 'Movie or serie not found' });
    res.json({ message: 'Movie or serie deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting movie or serie' });
  }
});

export default router;
