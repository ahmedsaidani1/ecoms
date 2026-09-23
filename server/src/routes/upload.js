import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { requireAdmin } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dossier = path.join(__dirname, '..', '..', 'uploads');
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

router.post('/', requireAdmin, upload.array('fichiers', 12), (req, res) => {
  const medias = (req.files || []).map((f) => ({
    url: `/uploads/${f.filename}`,
    type: f.mimetype.startsWith('video/') ? 'video' : 'image',
  }));
  res.status(201).json({ medias });
});

export default router;
