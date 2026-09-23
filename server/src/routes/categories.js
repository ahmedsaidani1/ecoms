import { Router } from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
import { slugify } from '../utils/slugify.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    res.json(await Category.find().sort({ ordre: 1, nom: 1 }));
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const nom = (req.body.nom || '').trim();
    if (!nom) return res.status(400).json({ message: 'Le nom est obligatoire' });
    const slug = slugify(nom);
    if (await Category.findOne({ slug })) {
      return res.status(409).json({ message: 'Cette catégorie existe déjà' });
    }
    const categorie = await Category.create({ nom, slug, ordre: Number(req.body.ordre) || 0 });
    res.status(201).json(categorie);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const nom = (req.body.nom || '').trim();
    if (!nom) return res.status(400).json({ message: 'Le nom est obligatoire' });
    const categorie = await Category.findByIdAndUpdate(
      req.params.id,
      { nom, slug: slugify(nom), ordre: Number(req.body.ordre) || 0 },
      { new: true, runValidators: true }
    );
    if (!categorie) return res.status(404).json({ message: 'Catégorie introuvable' });
    res.json(categorie);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const utilisee = await Product.countDocuments({ categorie: req.params.id });
    if (utilisee > 0) {
      return res
        .status(409)
        .json({ message: `Impossible de supprimer : ${utilisee} produit(s) utilisent cette catégorie` });
    }
    const categorie = await Category.findByIdAndDelete(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie introuvable' });
    res.json({ message: 'Catégorie supprimée' });
  } catch (e) {
    next(e);
  }
});

export default router;
