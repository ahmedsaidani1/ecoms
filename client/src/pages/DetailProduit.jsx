import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Galerie from '../components/Galerie.jsx';
import FormulaireCommande from '../components/FormulaireCommande.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api, formaterPrix, prixFinal } from '../api.js';

export default function DetailProduit() {
  const { slug } = useParams();
  const [produit, setProduit] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [essai, setEssai] = useState(0);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    window.scrollTo(0, 0);

    api
      .produit(slug)
      .then((p) => {
        setProduit(p);
        // Section facultative : si elle echoue, on la masque sans casser la page
        api
          .produits({ categorie: p.categorie?.slug || '', limit: 8 })
          .then((liste) => setSimilaires(liste.filter((x) => x.slug !== slug).slice(0, 4)))
          .catch(() => setSimilaires([]));
      })
      .catch((e) => setErreur(e))
      .finally(() => setChargement(false));
  }, [slug, essai]);

  if (chargement) return <div className="chargement">Chargement du produit...</div>;

  if (erreur?.horsLigne) {
    return (
      <div className="conteneur">
        <div className="vide">
          <h3>Connexion impossible</h3>
          <p>{erreur.message}</p>
          <button
            type="button"
            className="btn"
            style={{ marginTop: 20 }}
            onClick={() => setEssai((n) => n + 1)}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (erreur || !produit) {
    return (
      <div className="conteneur">
        <div className="vide">
          <h3>Produit introuvable</h3>
          <p>Ce produit n’existe plus ou a été retiré de la boutique.</p>
          <Link to="/produits" className="btn btn-secondaire" style={{ marginTop: 20 }}>
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const enPromo = produit.promotion > 0;

  return (
    <div className="conteneur">
      <nav className="fil-ariane">
        <Link to="/">Accueil</Link> / <Link to="/produits">Produits</Link>
        {produit.categorie && (
          <>
            {' / '}
            <Link to={`/produits?categorie=${produit.categorie.slug}`}>
              {produit.categorie.nom}
            </Link>
          </>
        )}
        {' / '}
        {produit.nom}
      </nav>

      <div className="produit-grille">
        <div>
          <Galerie medias={produit.medias} nom={produit.nom} />
        </div>

        <div className="produit-info">
          {produit.categorie && <span className="carte-categorie">{produit.categorie.nom}</span>}
          <h1>{produit.nom}</h1>

          <div className="produit-prix">
            <span className="prix">{formaterPrix(prixFinal(produit))}</span>
            {enPromo && (
              <>
                <span className="prix-barre">{formaterPrix(produit.prix)}</span>
                <span className="etiquette">-{produit.promotion}%</span>
              </>
            )}
          </div>
          {enPromo && (
            <p className="economie">
              Vous économisez {formaterPrix(produit.prix - prixFinal(produit))}
            </p>
          )}

          {produit.description && <p className="produit-description">{produit.description}</p>}

          <ul className="garanties">
            <li>Paiement à la livraison</li>
            <li>Livraison 24 gouvernorats</li>
            <li>Confirmation par appel</li>
            <li>{produit.stock > 0 ? 'En stock' : 'Épuisé pour le moment'}</li>
          </ul>

          <FormulaireCommande produit={produit} />
        </div>
      </div>

      {similaires.length > 0 && (
        <section className="section" style={{ borderTop: '1.5px dashed var(--trait-fort)' }}>
          <div className="section-entete">
            <div>
              <span className="surtitre">Dans le même rayon</span>
              <h2>
                Vous aimerez <span className="accent">aussi</span>
              </h2>
            </div>
          </div>
          <div className="grille-produits">
            {similaires.map((p) => (
              <ProductCard key={p._id} produit={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
