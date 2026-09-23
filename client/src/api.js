const CLE_TOKEN = 'econs_admin_token';

// Adresse de l'API. Vide en developpement (le proxy Vite redirige /api) ;
// en production, VITE_API_URL pointe vers le serveur Render.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

if (import.meta.env.PROD && !API_URL) {
  console.warn(
    "VITE_API_URL n'est pas definie : le site ne peut pas joindre l'API. " +
      'Ajoutez-la dans Netlify (Environment variables) puis redeployez.'
  );
}

// Les photos televersees en local sont stockees en chemin relatif (/uploads/...) :
// on les prefixe par l'adresse de l'API. Les URL completes (Cloudinary) restent telles quelles.
export function urlMedia(url) {
  if (!url) return url;
  return url.startsWith('/') ? `${API_URL}${url}` : url;
}

export const getToken = () => localStorage.getItem(CLE_TOKEN);
export const setToken = (t) => localStorage.setItem(CLE_TOKEN, t);
export const clearToken = () => localStorage.removeItem(CLE_TOKEN);

async function requete(chemin, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.admin) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let reponse;
  try {
    reponse = await fetch(`${API_URL}/api${chemin}`, { ...options, headers });
  } catch {
    throw erreurHorsLigne();
  }

  const texte = await reponse.text();
  let data = null;
  try {
    data = texte ? JSON.parse(texte) : null;
  } catch {
    // Pas du JSON : ce n'est pas l'API qui a repondu (page HTML de l'hebergeur,
    // page d'erreur du proxy...). Meme avec un statut 200, on ne renvoie pas null :
    // les pages attendent des tableaux et planteraient.
    throw erreurHorsLigne();
  }

  if (!reponse.ok) {
    if (reponse.status === 401 && options.admin) clearToken();
    // Pas de message de l'API : le serveur n'a pas repondu (demarrage, arret...)
    if (!data?.message && reponse.status >= 500) throw erreurHorsLigne();
    throw new Error(data?.message || 'Une erreur est survenue');
  }
  return data;
}

function erreurHorsLigne() {
  const erreur = new Error('Le serveur ne répond pas pour le moment. Réessayez dans un instant.');
  erreur.horsLigne = true;
  return erreur;
}

const json = (body) => JSON.stringify(body);

export const api = {
  // Public
  produits: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    ).toString();
    return requete(`/produits${qs ? `?${qs}` : ''}`);
  },
  produit: (slug) => requete(`/produits/${slug}`),
  categories: () => requete('/categories'),
  creerCommande: (data) => requete('/commandes', { method: 'POST', body: json(data) }),

  // Admin
  login: (motDePasse) => requete('/auth/login', { method: 'POST', body: json({ motDePasse }) }),
  adminProduits: () => requete('/produits?tous=1', { admin: true }),
  creerProduit: (data) => requete('/produits', { method: 'POST', body: json(data), admin: true }),
  modifierProduit: (id, data) =>
    requete(`/produits/${id}`, { method: 'PUT', body: json(data), admin: true }),
  supprimerProduit: (id) => requete(`/produits/${id}`, { method: 'DELETE', admin: true }),

  creerCategorie: (nom) => requete('/categories', { method: 'POST', body: json({ nom }), admin: true }),
  supprimerCategorie: (id) => requete(`/categories/${id}`, { method: 'DELETE', admin: true }),

  commandes: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    ).toString();
    return requete(`/commandes${qs ? `?${qs}` : ''}`, { admin: true });
  },
  stats: () => requete('/commandes/stats', { admin: true }),
  changerStatut: (id, statut) =>
    requete(`/commandes/${id}`, { method: 'PATCH', body: json({ statut }), admin: true }),
  supprimerCommande: (id) => requete(`/commandes/${id}`, { method: 'DELETE', admin: true }),

  televerser: (fichiers) => {
    const form = new FormData();
    for (const f of fichiers) form.append('fichiers', f);
    return requete('/upload', { method: 'POST', body: form, admin: true });
  },
};

export function formaterPrix(valeur) {
  const montant = Number(valeur || 0);
  // Un montant rond s'affiche sans millimes : "103 TND" plutot que "103,000 TND".
  const texte = Number.isInteger(montant) ? String(montant) : montant.toFixed(3).replace('.', ',');
  return `${texte} TND`;
}

// Doit rester identique au virtuel "prixFinal" du modele Product cote serveur.
export function prixFinal(produit) {
  if (!produit) return 0;
  if (!produit.promotion || produit.promotion <= 0) return produit.prix;
  const remise = (produit.prix * produit.promotion) / 100;
  return Math.floor(Math.round((produit.prix - remise) * 1000) / 1000);
}

export function formaterDate(iso) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
