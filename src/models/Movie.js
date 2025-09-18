import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  type: { type: String, enum: ['movie', 'serie'], required: true }
});

export default mongoose.model('Media', mediaSchema);
