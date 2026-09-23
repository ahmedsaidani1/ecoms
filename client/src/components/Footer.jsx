import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="pied">
      <div className="conteneur">
        <div className="pied-grille">
          <div>
            <Link to="/" className="logo" aria-label="TrouveTout, accueil">
              <img src="/logo.png" alt="TrouveTout" className="logo-pied" />
            </Link>
            <p>
              Votre bazar général. Commandez en quelques clics, payez à la livraison partout en
              Tunisie.
            </p>
          </div>

          <div>
            <h4>Boutique</h4>
            <ul>
              <li>
                <Link to="/">Accueil</Link>
              </li>
              <li>
                <Link to="/produits">Tous les produits</Link>
              </li>
              <li>
                <Link to="/produits?promo=true">Promotions</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Service</h4>
            <ul>
              <li>Paiement à la livraison</li>
              <li>Livraison 24 gouvernorats</li>
              <li>Confirmation par appel</li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li>Tél. 00 000 000</li>
              <li>contact@trouvetout.tn</li>
              <li>Tunis, Tunisie</li>
            </ul>
          </div>
        </div>

        <div className="pied-bas">
          <span>© {new Date().getFullYear()} TrouveTout. Tous droits réservés.</span>
          <span>Fait en Tunisie</span>
        </div>
      </div>
    </footer>
  );
}
