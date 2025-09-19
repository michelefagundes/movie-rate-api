const { medias } = require('../model/mediaModel');

function addMedia({ title, genre, releaseDate, type }) {
  const media = { id: medias.length + 1, title, genre, releaseDate, type, reviews: [] };
  medias.push(media);
  return media;
}

function reviewMedia({ mediaId, user, rating, comment }) {
  const media = medias.find(m => m.id === mediaId);
  if (!media) throw new Error('Media not found');
  if (media.reviews.find(r => r.user === user)) throw new Error('User already reviewed');
  media.reviews.push({ user, rating, comment });
  return media;
}

function listMedias() {
  return medias;
}

module.exports = { addMedia, reviewMedia, listMedias };
