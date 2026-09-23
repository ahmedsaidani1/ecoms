# TrouveTout — boutique en ligne

Site e-commerce TrouveTout ("votre bazar général") : React (Vite) + Node/Express + MongoDB.
Interface entièrement en français, prix en TND, paiement à la livraison.

## Démarrage

Deux terminaux, l'un pour l'API, l'autre pour le site.

```bash
# Terminal 1 — API (port 4000)
cd server
npm install
npm run dev

# Terminal 2 — site (port 5173)
cd client
npm install
npm run dev
```

Site : http://localhost:5173
Tableau de bord : http://localhost:5173/admin

## Connexion au tableau de bord

Le mot de passe est dans `server/.env` (`ADMIN_PASSWORD`), par défaut `admin123`.
Changez-le avant toute mise en ligne, ainsi que `JWT_SECRET`.

## Structure

```
server/
  src/
    index.js            point d'entrée de l'API
    db.js               connexion MongoDB
    models/             Product, Order, Category
    routes/             produits, commandes, categories, upload, auth
    middleware/auth.js  protection des routes admin (JWT)
    utils/              slug + liste des 24 gouvernorats
  uploads/              photos et vidéos envoyées depuis le tableau de bord

client/
  src/
    pages/              Accueil, Produits, DetailProduit
    pages/admin/        Commandes, Produits, FormulaireProduit, Catégories
    components/         Navbar, ProductCard, Carousel, Galerie,
                        FormulaireCommande, SelecteurGouvernorat
    styles.css          toute la feuille de styles
```

## Pages du site

- **Accueil** — bannière, carrousel « Meilleures ventes », carrousel « Promotions ».
- **Produits** — recherche, filtre par catégorie, filtre promotions.
- **Fiche produit** — galerie photos/vidéos, description, prix (barré si promotion)
  et formulaire de commande : nom complet, gouvernorat (recherche parmi les 24),
  téléphone à 8 chiffres, quantité.

## Tableau de bord

- **Commandes** — statistiques, recherche, filtre par statut, changement de statut
  (en attente, confirmée, expédiée, livrée, annulée), suppression.
- **Produits** — ajout et modification : nom, description, catégorie, prix,
  promotion en %, stock, plusieurs photos et vidéos, mise en avant « meilleure vente »,
  visibilité sur la boutique.
- **Catégories** — celles du menu « Toutes les catégories » de la barre de navigation.

## API

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/produits` | public |
| GET | `/api/produits/:slug` | public |
| POST / PUT / DELETE | `/api/produits` | admin |
| GET | `/api/categories` | public |
| POST / PUT / DELETE | `/api/categories` | admin |
| POST | `/api/commandes` | public |
| GET / PATCH / DELETE | `/api/commandes` | admin |
| GET | `/api/commandes/stats` | admin |
| POST | `/api/upload` | admin |
| GET | `/api/gouvernorats` | public |

## Déploiement

| Partie | Hébergeur | Dossier |
|---|---|---|
| Site (React) | Netlify | `client/` — configuré par `netlify.toml` |
| API (Node) | Render | `server/` |
| Base de données | MongoDB Atlas | — |
| Photos et vidéos | Cloudinary | — |

**Pourquoi Cloudinary :** le disque de Render (offre gratuite) est effacé à chaque
redémarrage. Les fichiers envoyés depuis le tableau de bord y seraient perdus.
Quand `CLOUDINARY_URL` est définie, l'API les envoie sur Cloudinary ; sinon (en local)
ils restent dans `server/uploads/`.

### Variables Netlify

| Nom | Valeur |
|---|---|
| `VITE_API_URL` | adresse Render, ex. `https://trouvetout-api.onrender.com` (sans `/` final) |

Elle est intégrée au moment du build : après l'avoir modifiée, relancez un déploiement.

### Variables Render

| Nom | Valeur |
|---|---|
| `MONGODB_URI` | chaîne de connexion Atlas |
| `MONGODB_DB` | `econs` |
| `ADMIN_PASSWORD` | mot de passe du tableau de bord (solide) |
| `JWT_SECRET` | longue chaîne aléatoire |
| `CLIENT_ORIGIN` | adresse Netlify, ex. `https://trouvetout.netlify.app` |
| `CLOUDINARY_URL` | `cloudinary://...` (tableau de bord Cloudinary) |

Render : dossier racine `server`, build `npm install`, démarrage `npm start`,
vérification de santé `/api/sante`. Dans Atlas, autorisez l'accès réseau `0.0.0.0/0`
(Render n'a pas d'adresse IP fixe).
