import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';
import { GOUVERNORATS } from './utils/gouvernorats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: (process.env.CLIENT_ORIGIN || '').replace(/^"|"$/g, '') || true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/sante', (_req, res) => res.json({ ok: true }));
app.get('/api/gouvernorats', (_req, res) => res.json(GOUVERNORATS));

app.use('/api/auth', authRoutes);
app.use('/api/produits', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/commandes', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Route introuvable' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ message: err.message || 'Erreur serveur' });
});

const port = Number(process.env.PORT) || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => console.log('API demarree sur http://localhost:%d', port));
  })
  .catch((err) => {
    console.error('Connexion MongoDB impossible :', err.message);
    process.exit(1);
  });
