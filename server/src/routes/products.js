import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { requireAdmin } from '../middleware/auth.js';
import { slugify } from '../utils/slugify.js';

const router = Router();

function nettoyerCorps(body) {
  const data = {
    nom: (body.nom || '').trim(),
    description: (body.description || '').trim(),
    prix: Number(body.prix),
    promotion: Number(body.promotion) || 0,
    stock: Number(body.stock) || 0,
    categorie: body.categorie || null,
    meilleureVente: Boolean(body.meilleureVente),
    actif: body.actif === undefined ? true : Boolean(body.actif),
    medias: Array.isArray(body.medias)
      ? body.medias
          .filter((m) => m && m.url)
          .map((m) => ({ url: m.url, type: m.type === 'video' ? 'video' : 'image' }))
      : [],
  };
  return data;
}

function valider(data) {
  if (!data.nom) return 'Le nom du produit est obligatoire';
  if (!Number.isFinite(data.prix) || data.prix < 0) return 'Le prix doit être un nombre positif';
  if (data.promotion < 0 || data.promotion > 100) return 'La promotion doit être entre 0 et 100';
  return null;
}

// Liste publique avec filtres
router.get('/', async (req, res, next) => {
  try {
    const { categorie, q, promo, meilleureVente, limit, tous } = req.query;
    const filtre = {};
    if (!tous) filtre.actif = true;

    if (categorie) {
      const cat = await Category.findOne({ slug: categorie });
      if (!cat) return res.json([]);
      filtre.categorie = cat._id;
    }
    if (q) filtre.nom = { $regex: String(q).trim(), $options: 'i' };
    if (promo === 'true') filtre.promotion = { $gt: 0 };
    if (meilleureVente === 'true') filtre.meilleureVente = true;

    let requete = Product.find(filtre).populate('categorie', 'nom slug').sort({ createdAt: -1 });
    if (limit) requete = requete.limit(Math.min(Number(limit) || 12, 60));

    res.json(await requete);
  } catch (e) {
    next(e);
  }
});

// Détail par slug (ou par id en secours)
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    let produit = await Product.findOne({ slug }).populate('categorie', 'nom slug');
    if (!produit && /^[0-9a-fA-F]{24}$/.test(slug)) {
      produit = await Product.findById(slug).populate('categorie', 'nom slug');
    }
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(produit);
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = nettoyerCorps(req.body);
    const erreur = valider(data);
    if (erreur) return res.status(400).json({ message: erreur });

    let slug = slugify(data.nom);
    if (await Product.findOne({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const produit = await Product.create({ ...data, slug });
    res.status(201).json(produit);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const data = nettoyerCorps(req.body);
    const erreur = valider(data);
    if (erreur) return res.status(400).json({ message: erreur });

    const existant = await Product.findById(req.params.id);
    if (!existant) return res.status(404).json({ message: 'Produit introuvable' });

    let slug = existant.slug;
    if (slugify(data.nom) !== existant.slug) {
      slug = slugify(data.nom);
      if (await Product.findOne({ slug, _id: { $ne: existant._id } })) {
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }
    }

    Object.assign(existant, data, { slug });
    await existant.save();
    res.json(existant);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const produit = await Product.findByIdAndDelete(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
    res.json({ message: 'Produit supprimé' });
  } catch (e) {
    next(e);
  }
});

export default router;
