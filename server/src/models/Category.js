import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    ordre: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  if (!this.slug && this.nom) this.slug = slugify(this.nom);
  next();
});

export default mongoose.model('Category', categorySchema);
