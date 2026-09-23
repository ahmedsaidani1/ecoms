import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    prix: { type: Number, required: true, min: 0 },
    promotion: { type: Number, default: 0, min: 0, max: 100 },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    stock: { type: Number, default: 0, min: 0 },
    medias: { type: [mediaSchema], default: [] },
    meilleureVente: { type: Boolean, default: false },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Prix apres remise, tronque au dinar entier : une promotion ne doit pas
// produire un prix bancal du genre 15,300 TND.
productSchema.virtual('prixFinal').get(function () {
  if (!this.promotion || this.promotion <= 0) return this.prix;
  const remise = (this.prix * this.promotion) / 100;
  // On arrondit d'abord au millime pour eviter les imprecisions flottantes
  // (26,999999 au lieu de 27) avant de tronquer.
  return Math.floor(Math.round((this.prix - remise) * 1000) / 1000);
});

productSchema.pre('validate', function (next) {
  if (!this.slug && this.nom) this.slug = slugify(this.nom);
  next();
});

export default mongoose.model('Product', productSchema);
