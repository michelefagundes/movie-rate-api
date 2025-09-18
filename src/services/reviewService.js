import Review from '../models/Review.js';

export async function createReview(userId, mediaId, rating, comment) {
  const existing = await Review.findOne({ user: userId, movie: mediaId });
  if (existing) throw new Error('You already reviewed this media');
  const review = new Review({ user: userId, movie: mediaId, rating, comment });
  await review.save();
  return review;
}

export async function getReviewsByMedia(mediaId) {
  return await Review.find({ movie: mediaId }).populate('user', 'username');
}

export async function getReviewsByUser(userId) {
  return await Review.find({ user: userId }).populate('movie', 'title');
}

export async function updateReview(userId, reviewId, data) {
  return await Review.findOneAndUpdate({ _id: reviewId, user: userId }, data, { new: true });
}

export async function deleteReview(userId, reviewId) {
  return await Review.findOneAndDelete({ _id: reviewId, user: userId });
}
