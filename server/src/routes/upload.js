import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Avec CLOUDINARY_URL (production), les medias partent sur Cloudinary :
// le disque de Render est efface a chaque redemarrage, les photos y seraient perdues.
// Sans (developpement), ils restent dans server/uploads comme avant.
// Le SDK Cloudinary lit CLOUDINARY_URL tout seul.
const enLigne = Boolean(process.env.CLOUDINARY_URL);

// En ligne, les fichiers transitent par le dossier temporaire plutot que par la
// memoire : quelques videos suffiraient a saturer les 512 Mo de Render gratuit.
const dossier = enLigne ? os.tmpdir() : path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(dossier, { recursive: true });

const TYPES_AUTORISES = /^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime))$/;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dossier),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').slice(0, 40);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (!TYPES_AUTORISES.test(file.mimetype)) {
      return cb(new Error('Format non supporté (images et vidéos uniquement)'));
    }
    cb(null, true);
  },
});

const router = Router();

router.post('/', requireAdmin, upload.array('fichiers', 12), async (req, res, next) => {
  const fichiers = req.files || [];

  try {
    if (!enLigne) {
      const medias = fichiers.map((f) => ({
        url: `/uploads/${f.filename}`,
        type: f.mimetype.startsWith('video/') ? 'video' : 'image',
      }));
      return res.status(201).json({ medias });
    }

    const medias = [];
    for (const f of fichiers) {
      const resultat = await cloudinary.uploader.upload(f.path, {
        folder: 'trouvetout',
        resource_type: f.mimetype.startsWith('video/') ? 'video' : 'image',
      });
      medias.push({
        url: resultat.secure_url,
        type: resultat.resource_type === 'video' ? 'video' : 'image',
      });
    }
    res.status(201).json({ medias });
  } catch (e) {
    next(e);
  } finally {
    // Supprime les copies temporaires une fois envoyees
    if (enLigne) {
      for (const f of fichiers) fs.promises.unlink(f.path).catch(() => {});
    }
  }
});

export default router;
