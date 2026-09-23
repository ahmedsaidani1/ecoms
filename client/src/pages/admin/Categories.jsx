import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [nom, setNom] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  function charger() {
    api.categories().then(setCategories).catch((e) => setErreur(e.message));
  }

  useEffect(charger, []);

  async function ajouter(e) {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      const creee = await api.creerCategorie(nom);
      setCategories((l) => [...l, creee]);
      setNom('');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(c) {
    if (!window.confirm(`Supprimer la catégorie "${c.nom}" ?`)) return;
    try {
      await api.supprimerCategorie(c._id);
      setCategories((l) => l.filter((x) => x._id !== c._id));
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <>
      <div className="admin-entete">
        <h1>Catégories</h1>
      </div>

      {erreur && <div className="message message-erreur">{erreur}</div>}

      <div className="bloc formulaire-admin">
        <h3>Ajouter une catégorie</h3>
        <form className="ligne-ajout" onSubmit={ajouter}>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom de la catégorie"
          />
          <button type="submit" className="btn" disabled={envoi || !nom.trim()}>
            Ajouter
          </button>
        </form>

        <div className="liste-categories">
          {categories.map((c) => (
            <div className="ligne-categorie" key={c._id}>
              <span>{c.nom}</span>
              <button
                type="button"
                className="btn btn-danger btn-petit"
                onClick={() => supprimer(c)}
              >
                Supprimer
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p style={{ color: 'var(--gris-clair)', fontSize: 14 }}>Aucune catégorie.</p>
          )}
        </div>
      </div>
    </>
  );
}
