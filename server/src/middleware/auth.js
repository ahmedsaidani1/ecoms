import jwt from 'jsonwebtoken';

const secret = () => (process.env.JWT_SECRET || 'secret-dev').replace(/^"|"$/g, '');

export function signerToken() {
  return jwt.sign({ role: 'admin' }, secret(), { expiresIn: '7d' });
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentification requise' });
  try {
    jwt.verify(token, secret());
    next();
  } catch {
    res.status(401).json({ message: 'Session expirée, reconnectez-vous' });
  }
}
