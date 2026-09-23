import { Router } from 'express';
import { signerToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const attendu = (process.env.ADMIN_PASSWORD || '').replace(/^"|"$/g, '');
  const { motDePasse } = req.body || {};
  if (!motDePasse || motDePasse !== attendu) {
    return res.status(401).json({ message: 'Mot de passe incorrect' });
  }
  res.json({ token: signerToken() });
});

export default router;
