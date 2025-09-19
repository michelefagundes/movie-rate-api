
const express = require('express');
const router = express.Router();
const mediaService = require('../service/mediaService');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secretdemo';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

router.post('/medias', authMiddleware, (req, res) => {
  const { title, genre, releaseDate, type } = req.body;
  if (!title || !genre || !releaseDate || !type) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // Check for duplicate title
  const { medias } = require('../model/mediaModel');
  if (medias.find(m => m.title === title)) {
    return res.status(400).json({ message: 'Media with this title already exists' });
  }
  try {
    const media = mediaService.addMedia(req.body);
    res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/medias/:id/review', authMiddleware, (req, res) => {
  if (!req.body.comment) {
    return res.status(400).json({ error: 'Comment is required' });
  }
  try {
    const media = mediaService.reviewMedia({ mediaId: Number(req.params.id), user: req.user, rating: req.body.rating, comment: req.body.comment });
    res.status(201).json(media);
  } catch (err) {
    if (err.message === 'User already reviewed') {
      return res.status(400).json({ message: 'You already reviewed this movie' });
    }
    res.status(400).json({ error: err.message });
  }
});
// List all reviews of a media
router.get('/medias/:id/reviews', authMiddleware, (req, res) => {
  const { medias } = require('../model/mediaModel');
  const media = medias.find(m => m.id === Number(req.params.id));
  if (!media) return res.status(404).json({ error: 'Media not found' });
  res.status(200).json(media.reviews || []);
});

router.get('/medias', authMiddleware, (req, res) => {
  res.json(mediaService.listMedias());
});

module.exports = router;
