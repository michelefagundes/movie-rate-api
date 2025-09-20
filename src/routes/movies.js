import express from 'express';
const { medias } = require('../model/mediaModel');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
  const media = { id: medias.length + 1, ...req.body };
  medias.push(media);
  res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ message: 'Error creating movie or serie' });
  }
});

router.get('/', async (req, res) => {
  const { genre, releaseDate, minRating, type } = req.query;
  let filter = {};
  if (genre) filter.genre = genre;
  if (releaseDate) filter.releaseDate = { $gte: new Date(releaseDate) };
  if (type) filter.type = type;
  let filteredMedias = medias.filter(m => {
    let match = true;
    if (genre) match = match && m.genre === genre;
    if (releaseDate) match = match && new Date(m.releaseDate) >= new Date(releaseDate);
    if (type) match = match && m.type === type;
    return match;
  });

  res.json(filteredMedias);
});

router.get('/:id', async (req, res) => {
  try {
  const media = medias.find(m => m.id === Number(req.params.id));
  if (!media) return res.status(404).json({ message: 'Movie or serie not found' });
  res.json(media);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching movie or serie' });
  }
});

router.put('/:id', async (req, res) => {
  try {
  const media = medias.find(m => m.id === Number(req.params.id));
  if (!media) return res.status(404).json({ message: 'Movie or serie not found' });
  Object.assign(media, req.body);
  res.json(media);
  } catch (err) {
    res.status(400).json({ message: 'Error updating movie or serie' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
  const idx = medias.findIndex(m => m.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Movie or serie not found' });
  medias.splice(idx, 1);
  res.json({ message: 'Movie or serie deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting movie or serie' });
  }
});

export default router;
