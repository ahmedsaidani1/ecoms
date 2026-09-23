import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Connexion from './Connexion.jsx';
import { clearToken, getToken } from '../../api.js';

export default function Tableau() {
  const [connecte, setConnecte] = useState(Boolean(getToken()));
  const naviguer = useNavigate();

  if (!connecte) return <Connexion onConnexion={() => setConnecte(true)} />;

  function deconnecter() {
    clearToken();
    setConnecte(false);
    naviguer('/admin');
  }

  const classe = ({ isActive }) => (isActive ? 'actif' : '');

  return (
    <div className="admin">
      <aside className="admin-lateral">
        <Link to="/" className="logo" aria-label="TrouveTout, accueil">
          <img src="/logo-mot.png" alt="TrouveTout" className="logo-image" />
        </Link>

        <nav className="admin-menu">
          <NavLink to="/admin" className={classe} end>
            Commandes
          </NavLink>
          <NavLink to="/admin/produits" className={classe}>
            Produits
          </NavLink>
          <NavLink to="/admin/produits/nouveau" className={classe}>
            Ajouter un produit
          </NavLink>
          <NavLink to="/admin/categories" className={classe}>
            Catégories
          </NavLink>
        </nav>

        <button type="button" className="btn btn-secondaire btn-petit" onClick={deconnecter}>
          Se déconnecter
        </button>
      </aside>

      <div className="admin-contenu">
        <Outlet context={{ deconnecter }} />
      </div>
    </div>
  );
}
