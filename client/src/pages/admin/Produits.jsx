import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formaterPrix, prixFinal } from '../../api.js';

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  function charger() {
    setChargement(true);
    api
      .adminProduits()
      .then(setProduits)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }

  useEffect(charger, []);

  async function supprimer(produit) {
    if (!window.confirm(`Supprimer "${produit.nom}" ?`)) return;
    try {
      await api.supprimerProduit(produit._id);
      setProduits((liste) => liste.filter((p) => p._id !== produit._id));
    } catch (e) {
      setErreur(e.message);
    }
  }

  return (
    <>
      <div className="admin-entete">
        <h1>Produits</h1>
        <Link to="/admin/produits/nouveau" className="btn">
          Ajouter un produit
        </Link>
      </div>

      {erreur && <div className="message message-erreur">{erreur}</div>}

      {chargement ? (
        <div className="chargement">Chargement...</div>
      ) : produits.length === 0 ? (
        <div className="vide">
          <h3>Aucun produit</h3>
          <p>Commencez par ajouter votre premier produit.</p>
        </div>
      ) : (
        <div className="tableau-cadre">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Promotion</th>
                <th>Stock</th>
                <th>État</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => {
                const media = p.medias?.find((m) => m.type === 'image') || p.medias?.[0];
                return (
                  <tr key={p._id}>
                    <td>
                      <div className="cellule-produit">
                        {media && media.type === 'image' ? (
                          <img src={media.url} alt="" />
                        ) : (
                          <div className="sans-image-mini" />
                        )}
                        <div>
                          <div style={{ fontWeight: 500 }}>{p.nom}</div>
                          {p.meilleureVente && (
                            <span style={{ fontSize: 12, color: 'var(--gris)' }}>
                              Meilleure vente
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{p.categorie?.nom || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formaterPrix(prixFinal(p))}
                      {p.promotion > 0 && (
                        <div className="prix-barre" style={{ fontSize: 12 }}>
                          {formaterPrix(p.prix)}
                        </div>
                      )}
                    </td>
                    <td>{p.promotion > 0 ? `-${p.promotion}%` : '—'}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`etat ${p.actif ? 'etat-livree' : 'etat-annulee'}`}>
                        {p.actif ? 'En ligne' : 'Masqué'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-ligne">
                        <Link to={`/admin/produits/${p._id}`} className="btn btn-secondaire btn-petit">
                          Modifier
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger btn-petit"
                          onClick={() => supprimer(p)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
