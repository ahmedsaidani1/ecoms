import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { Loupe } from '../components/Icones.jsx';
import Squelette from '../components/Squelette.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { api } from '../api.js';

export default function Produits() {
  const { categories } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState(params.get('q') || '');
  const [refGrille, grilleVisible] = useReveal();

  const categorie = params.get('categorie') || '';
  const promo = params.get('promo') === 'true';

  // Synchronise la recherche avec l'URL (anti-rebond)
  useEffect(() => {
    const minuteur = setTimeout(() => {
      const suivant = new URLSearchParams(params);
      if (recherche) suivant.set('q', recherche);
      else suivant.delete('q');
      if (suivant.toString() !== params.toString()) setParams(suivant, { replace: true });
    }, 300);
    return () => clearTimeout(minuteur);
  }, [recherche]);

  useEffect(() => {
    setChargement(true);
    api
      .produits({
        categorie,
        promo: promo ? 'true' : '',
        q: params.get('q') || '',
      })
      .then(setProduits)
      .catch(() => setProduits([]))
      .finally(() => setChargement(false));
  }, [categorie, promo, params.get('q')]);

  function filtrer(cle, valeur) {
    const suivant = new URLSearchParams(params);
    if (valeur) suivant.set(cle, valeur);
    else suivant.delete(cle);
    setParams(suivant);
  }

  function toutEffacer() {
    setParams(new URLSearchParams(recherche ? { q: recherche } : {}));
  }

  const filtreActif = Boolean(categorie) || promo;
  const titre = promo
    ? 'Promotions'
    : categories.find((c) => c.slug === categorie)?.nom || 'Tous les produits';

  return (
    <>
      <div className="page-entete">
        <div className="conteneur page-entete-ligne">
          <div>
            <span className="surtitre">{promo ? 'Bonnes affaires' : 'La boutique'}</span>
            <h1>{titre}</h1>
            <span className="compteur">
              {chargement
                ? 'Chargement...'
                : `${produits.length} produit${produits.length > 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="recherche">
            <Loupe />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un produit"
              aria-label="Rechercher un produit"
            />
          </div>
        </div>
      </div>

      <div className="conteneur" style={{ paddingBottom: 96 }}>
        <div className="disposition-produits">
          <aside className="filtres" aria-label="Filtres">
            <div className="filtres-entete">
              <h3>Filtres</h3>
              {filtreActif && (
                <button type="button" className="reinitialiser" onClick={toutEffacer}>
                  Effacer
                </button>
              )}
            </div>

            <div className="filtres-groupe">
              <h4>Catégories</h4>
              <div className="filtres-liste">
                <button
                  type="button"
                  className={`filtre-option ${!categorie ? 'active' : ''}`}
                  onClick={() => filtrer('categorie', '')}
                >
                  Toutes
                </button>
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c._id}
                    className={`filtre-option ${categorie === c.slug ? 'active' : ''}`}
                    onClick={() => filtrer('categorie', categorie === c.slug ? '' : c.slug)}
                  >
                    {c.nom}
                  </button>
                ))}
                {categories.length === 0 && <span className="menu-vide">Aucune catégorie</span>}
              </div>
            </div>

            <div className="filtres-groupe">
              <h4>Offres</h4>
              <div className="filtres-liste">
                <button
                  type="button"
                  className={`filtre-option ${promo ? 'active' : ''}`}
                  onClick={() => filtrer('promo', promo ? '' : 'true')}
                >
                  En promotion
                </button>
              </div>
            </div>
          </aside>

          <div className="colonne-produits">
            {chargement ? (
              <Squelette lignes={6} titre={false} />
            ) : produits.length === 0 ? (
              <div className="vide">
                <h3>Aucun produit trouvé</h3>
                <p>Essayez une autre recherche ou une autre catégorie.</p>
              </div>
            ) : (
              <div className={`reveal ${grilleVisible ? 'apparu' : ''}`} ref={refGrille}>
                <div className="grille-produits cascade">
                  {produits.map((p) => (
                    <ProductCard key={p._id} produit={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
