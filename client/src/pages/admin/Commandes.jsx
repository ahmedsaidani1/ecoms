import { useEffect, useState } from 'react';
import { api, formaterDate, formaterPrix } from '../../api.js';

const STATUTS = ['en attente', 'confirmee', 'expediee', 'livree', 'annulee'];
const LIBELLES = {
  'en attente': 'En attente',
  confirmee: 'Confirmée',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};
const CLASSES = {
  'en attente': 'etat-attente',
  confirmee: 'etat-confirmee',
  expediee: 'etat-expediee',
  livree: 'etat-livree',
  annulee: 'etat-annulee',
};

export default function Commandes() {
  const [commandes, setCommandes] = useState([]);
  const [stats, setStats] = useState(null);
  const [statut, setStatut] = useState('');
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  function charger() {
    setChargement(true);
    Promise.all([api.commandes({ statut, q: recherche }), api.stats()])
      .then(([liste, s]) => {
        setCommandes(liste);
        setStats(s);
        setErreur('');
      })
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    const minuteur = setTimeout(charger, 250);
    return () => clearTimeout(minuteur);
  }, [statut, recherche]);

  async function changerStatut(id, nouveau) {
    try {
      await api.changerStatut(id, nouveau);
      setCommandes((liste) =>
        liste.map((c) => (c._id === id ? { ...c, statut: nouveau } : c))
      );
      api.stats().then(setStats).catch(() => {});
    } catch (e) {
      setErreur(e.message);
    }
  }

  async function supprimer(id) {
    if (!window.confirm('Supprimer définitivement cette commande ?')) return;
    try {
      await api.supprimerCommande(id);
      setCommandes((liste) => liste.filter((c) => c._id !== id));
    } catch (e) {
      setErreur(e.message);
    }
  }

  return (
    <>
      <div className="admin-entete">
        <h1>Commandes</h1>
      </div>

      {erreur && <div className="message message-erreur">{erreur}</div>}

      {stats && (
        <div className="stats">
          <div className="stat">
            <span>Total commandes</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat">
            <span>En attente</span>
            <strong>{stats.enAttente}</strong>
          </div>
          <div className="stat">
            <span>Livrées</span>
            <strong>{stats.livrees}</strong>
          </div>
          <div className="stat">
            <span>Chiffre d'affaires</span>
            <strong>{formaterPrix(stats.chiffreAffaires)}</strong>
          </div>
        </div>
      )}

      <div className="barre-filtres">
        <div className="recherche">
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Nom, téléphone, numéro..."
            style={{ paddingLeft: 12 }}
          />
        </div>
        <div className="puces">
          <button
            type="button"
            className={`puce ${statut === '' ? 'active' : ''}`}
            onClick={() => setStatut('')}
          >
            Toutes
          </button>
          {STATUTS.map((s) => (
            <button
              type="button"
              key={s}
              className={`puce ${statut === s ? 'active' : ''}`}
              onClick={() => setStatut(s)}
            >
              {LIBELLES[s]}
            </button>
          ))}
        </div>
      </div>

      {chargement ? (
        <div className="chargement">Chargement des commandes...</div>
      ) : commandes.length === 0 ? (
        <div className="vide">
          <h3>Aucune commande</h3>
          <p>Les commandes passées sur le site apparaîtront ici.</p>
        </div>
      ) : (
        <div className="tableau-cadre">
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Date</th>
                <th>Client</th>
                <th>Gouvernorat</th>
                <th>Téléphone</th>
                <th>Produit</th>
                <th>Qté</th>
                <th>Total</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{c.numero}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formaterDate(c.createdAt)}</td>
                  <td>{c.nomComplet}</td>
                  <td>{c.gouvernorat}</td>
                  <td>{c.telephone}</td>
                  <td>{c.produitNom}</td>
                  <td>{c.quantite}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formaterPrix(c.total)}</td>
                  <td>
                    <span className={`etat ${CLASSES[c.statut]}`} style={{ marginBottom: 6 }}>
                      {LIBELLES[c.statut]}
                    </span>
                    <select
                      className="select-etat"
                      value={c.statut}
                      onChange={(e) => changerStatut(c._id, e.target.value)}
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>
                          {LIBELLES[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="actions-ligne">
                      <button
                        type="button"
                        className="btn btn-danger btn-petit"
                        onClick={() => supprimer(c._id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
