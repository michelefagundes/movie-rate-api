import Media from '../models/Movie.js';
import Review from '../models/Review.js';

export async function createMedia(data) {
  const media = new Media(data);
  await media.save();
  return media;
}

export async function getMedias(filter, minRating) {
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
  return medias;
}

export async function getMediaById(id) {
  return await Media.findById(id);
}

export async function updateMedia(id, data) {
  return await Media.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteMedia(id) {
  return await Media.findByIdAndDelete(id);
}
