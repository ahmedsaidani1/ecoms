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

## Mise en production

1. `cd client && npm run build` produit `client/dist`.
2. Servez `client/dist` avec votre hébergeur et faites pointer `/api` et `/uploads`
   vers le serveur Node.
3. Dans `server/.env` : changez `ADMIN_PASSWORD` et `JWT_SECRET`, et renseignez
   `CLIENT_ORIGIN` avec le domaine réel.
4. Les fichiers envoyés sont stockés dans `server/uploads` : prévoyez une sauvegarde
   ou un stockage externe.
