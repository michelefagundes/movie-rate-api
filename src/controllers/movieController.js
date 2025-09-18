import Media from '../models/Movie.js';
import Review from '../models/Review.js';

export const createMedia = async (req, res) => {
  try {
    const media = new Media(req.body);
    await media.save();
    res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ message: 'Error when creating movie or serie' });
  }
};

export const getMedias = async (req, res) => {
  const { genre, releaseDate, minRating, type } = req.query;
  let filter = {};
  if (genre) filter.genre = genre;
  if (releaseDate) filter.releaseDate = { $gte: new Date(releaseDate) };
  if (type) filter.type = type;
  let medias = await Media.find(filter);
  if (minRating) {
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
};

export const getMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Movie or serie not found' });
    res.json(media);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching movie or serie' });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!media) return res.status(404).json({ message: 'Movie or serie not found' });
    res.json(media);
  } catch (err) {
    res.status(400).json({ message: 'Error updating movie or serie' });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ message: 'Movie or serie not found' });
    res.json({ message: 'Movie or serie deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting movie or serie' });
  }
};
