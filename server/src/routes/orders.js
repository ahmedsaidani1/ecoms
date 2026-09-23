import { Router } from 'express';
import Order, { STATUTS } from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
import { GOUVERNORATS } from '../utils/gouvernorats.js';

const router = Router();

// Passer une commande (public)
router.post('/', async (req, res, next) => {
  try {
    const nomComplet = (req.body.nomComplet || '').trim();
    const gouvernorat = (req.body.gouvernorat || '').trim();
    const telephone = String(req.body.telephone || '').replace(/\s/g, '');
    const quantite = Number(req.body.quantite);
    const produitId = req.body.produit;

    if (nomComplet.length < 3) {
      return res.status(400).json({ message: 'Nom complet invalide' });
    }
    if (!GOUVERNORATS.includes(gouvernorat)) {
      return res.status(400).json({ message: 'Gouvernorat invalide' });
    }
    if (!/^[0-9]{8}$/.test(telephone)) {
      return res.status(400).json({ message: 'Le numéro de téléphone doit contenir 8 chiffres' });
    }
    if (!Number.isInteger(quantite) || quantite < 1) {
      return res.status(400).json({ message: 'Quantité invalide' });
    }

    const produit = await Product.findById(produitId);
    if (!produit || !produit.actif) {
      return res.status(404).json({ message: 'Produit indisponible' });
    }

    const prixUnitaire = produit.prixFinal;
    const commande = await Order.create({
      nomComplet,
      gouvernorat,
      telephone,
      quantite,
      produit: produit._id,
      produitNom: produit.nom,
      prixUnitaire,
      promotion: produit.promotion,
      total: Math.round(prixUnitaire * quantite * 1000) / 1000,
      note: (req.body.note || '').trim(),
    });

    res.status(201).json({ numero: commande.numero, total: commande.total });
  } catch (e) {
    next(e);
  }
});

// Liste des commandes (admin)
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const filtre = {};
    if (req.query.statut && STATUTS.includes(req.query.statut)) filtre.statut = req.query.statut;
    if (req.query.q) {
      const regex = { $regex: String(req.query.q).trim(), $options: 'i' };
      filtre.$or = [{ nomComplet: regex }, { telephone: regex }, { numero: regex }, { produitNom: regex }];
    }
    const commandes = await Order.find(filtre).sort({ createdAt: -1 }).limit(500);
    res.json(commandes);
  } catch (e) {
    next(e);
  }
});

// Statistiques du tableau de bord (admin)
router.get('/stats', requireAdmin, async (_req, res, next) => {
  try {
    const [total, enAttente, livrees, produits, chiffre] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ statut: 'en attente' }),
      Order.countDocuments({ statut: 'livree' }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { statut: { $ne: 'annulee' } } },
        { $group: { _id: null, somme: { $sum: '$total' } } },
      ]),
    ]);
    res.json({
      total,
      enAttente,
      livrees,
      produits,
      chiffreAffaires: chiffre[0]?.somme || 0,
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { statut } = req.body;
    if (!STATUTS.includes(statut)) return res.status(400).json({ message: 'Statut invalide' });
    const commande = await Order.findByIdAndUpdate(req.params.id, { statut }, { new: true });
    if (!commande) return res.status(404).json({ message: 'Commande introuvable' });
    res.json(commande);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const commande = await Order.findByIdAndDelete(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande introuvable' });
    res.json({ message: 'Commande supprimée' });
  } catch (e) {
    next(e);
  }
});

export default router;
