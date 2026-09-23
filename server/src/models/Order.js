import mongoose from 'mongoose';
import { GOUVERNORATS } from '../utils/gouvernorats.js';

export const STATUTS = ['en attente', 'confirmee', 'expediee', 'livree', 'annulee'];

const orderSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true, index: true },
    nomComplet: { type: String, required: true, trim: true },
    gouvernorat: { type: String, required: true, enum: GOUVERNORATS },
    telephone: { type: String, required: true, match: /^[0-9]{8}$/ },
    quantite: { type: Number, required: true, min: 1 },
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    produitNom: { type: String, required: true },
    prixUnitaire: { type: Number, required: true },
    promotion: { type: Number, default: 0 },
    total: { type: Number, required: true },
    statut: { type: String, enum: STATUTS, default: 'en attente' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function (next) {
  if (!this.numero) {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    this.numero = `CMD-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
