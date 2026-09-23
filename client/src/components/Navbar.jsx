import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronBas, Croix, Loupe, Menu } from './Icones.jsx';

export default function Navbar({ categories }) {
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const [categoriesOuvertes, setCategoriesOuvertes] = useState(false);
  const [defile, setDefile] = useState(false);
  const deroulant = useRef(null);
  const location = useLocation();

  // Ferme tout a chaque changement de page
  useEffect(() => {
    setTiroirOuvert(false);
    setCategoriesOuvertes(false);
  }, [location.pathname, location.search]);

  // Ferme le menu deroulant du bureau au clic exterieur
  useEffect(() => {
    function clicExterieur(e) {
      if (deroulant.current && !deroulant.current.contains(e.target)) {
        setCategoriesOuvertes(false);
      }
    }
    document.addEventListener('mousedown', clicExterieur);
    return () => document.removeEventListener('mousedown', clicExterieur);
  }, []);

  // Bloque le defilement de la page pendant que le tiroir est ouvert
  useEffect(() => {
    document.body.classList.toggle('corps-bloque', tiroirOuvert);
    return () => document.body.classList.remove('corps-bloque');
  }, [tiroirOuvert]);

  // Ombre sous l'entete des que la page defile
  useEffect(() => {
    function auDefilement() {
      setDefile(window.scrollY > 4);
    }
    auDefilement();
    window.addEventListener('scroll', auDefilement, { passive: true });
    return () => window.removeEventListener('scroll', auDefilement);
  }, []);

  // Echap ferme le tiroir
  useEffect(() => {
    if (!tiroirOuvert) return;
    function auClavier(e) {
      if (e.key === 'Escape') setTiroirOuvert(false);
    }
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [tiroirOuvert]);

  // Etat actif des liens du tiroir (les parametres d'URL comptent)
  const surProduits = location.pathname === '/produits';
  const params = new URLSearchParams(location.search);
  const categorieActive = surProduits ? params.get('categorie') : null;
  const promoActive = surProduits && params.get('promo') === 'true';
  const tousActif = surProduits && !promoActive && !categorieActive;

  return (
    <>
      <header className={`entete ${defile ? 'defile' : ''}`}>
        <div className="conteneur entete-barre">
          <Link to="/" className="logo" aria-label="TrouveTout, accueil">
            <img src="/logo-mot.png" alt="TrouveTout" className="logo-image" />
          </Link>

          <nav className="nav">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'actif' : '')} end>
              Accueil
            </NavLink>

            <div className="menu-deroulant" ref={deroulant}>
              <button
                type="button"
                className={`menu-bouton ${categoriesOuvertes ? 'actif' : ''}`}
                onClick={() => setCategoriesOuvertes((v) => !v)}
                aria-expanded={categoriesOuvertes}
              >
                Toutes les catégories
                <ChevronBas />
              </button>

              {categoriesOuvertes && (
                <div className="menu-panneau">
                  <Link to="/produits">Tous les produits</Link>
                  {categories.map((c) => (
                    <Link key={c._id} to={`/produits?categorie=${c.slug}`}>
                      {c.nom}
                    </Link>
                  ))}
                  {categories.length === 0 && <span className="menu-vide">Aucune catégorie</span>}
                </div>
              )}
            </div>

            <Link to="/produits?promo=true" className={`nav-promo ${promoActive ? 'actif' : ''}`}>
              Promotions
            </Link>
          </nav>

          <div className="entete-actions">
            {/* La page produits a deja sa propre recherche */}
            {!surProduits && (
              <Link to="/produits" className="bouton-recherche">
                <Loupe />
                <span>Rechercher un produit</span>
              </Link>
            )}

            <button
              type="button"
              className="burger"
              onClick={() => setTiroirOuvert(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={tiroirOuvert}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* Tiroir lateral (mobile) */}
      <div
        className={`voile ${tiroirOuvert ? 'visible' : ''}`}
        onClick={() => setTiroirOuvert(false)}
        aria-hidden="true"
      />

      <aside
        className={`tiroir ${tiroirOuvert ? 'ouvert' : ''}`}
        aria-label="Menu principal"
        aria-hidden={!tiroirOuvert}
      >
        <div className="tiroir-entete">
          <span className="logo">
            <img src="/logo-mot.png" alt="TrouveTout" className="logo-image" />
          </span>
          <button
            type="button"
            className="tiroir-fermer"
            onClick={() => setTiroirOuvert(false)}
            aria-label="Fermer le menu"
          >
            <Croix />
          </button>
        </div>

        <nav className="tiroir-liens">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'actif' : '')} end>
            Accueil
          </NavLink>
          <Link to="/produits" className={tousActif ? 'actif' : ''}>
            Tous les produits
          </Link>
          <Link to="/produits?promo=true" className={promoActive ? 'actif' : ''}>
            Promotions
          </Link>
        </nav>

        <div className="tiroir-section">
          <h4>Catégories</h4>
          <nav className="tiroir-liens">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/produits?categorie=${c.slug}`}
                className={categorieActive === c.slug ? 'actif' : ''}
              >
                {c.nom}
              </Link>
            ))}
            {categories.length === 0 && <span className="menu-vide">Aucune catégorie</span>}
          </nav>
        </div>

        <div className="tiroir-pied">
          <strong>Tout trouver !</strong>
          Paiement à la livraison, partout en Tunisie.
        </div>
      </aside>
    </>
  );
}
