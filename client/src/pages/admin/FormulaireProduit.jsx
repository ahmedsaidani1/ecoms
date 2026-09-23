import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, formaterPrix, prixFinal, urlMedia } from '../../api.js';

const VIDE = {
  nom: '',
  description: '',
  prix: '',
  promotion: 0,
  stock: 0,
  categorie: '',
  meilleureVente: false,
  actif: true,
  medias: [],
};

export default function FormulaireProduit() {
  const { id } = useParams();
  const naviguer = useNavigate();
  const edition = Boolean(id);
  const fichierRef = useRef(null);

  const [valeurs, setValeurs] = useState(VIDE);
  const [categories, setCategories] = useState([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [televersement, setTeleversement] = useState(false);
  const [chargement, setChargement] = useState(edition);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!edition) return;
    api
      .adminProduits()
      .then((liste) => {
        const p = liste.find((x) => x._id === id);
        if (!p) throw new Error('Produit introuvable');
        setValeurs({
          nom: p.nom,
          description: p.description || '',
          prix: p.prix,
          promotion: p.promotion || 0,
          stock: p.stock || 0,
          categorie: p.categorie?._id || p.categorie || '',
          meilleureVente: p.meilleureVente,
          actif: p.actif,
          medias: p.medias || [],
        });
      })
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }, [id]);

  const modifier = (champ, valeur) => setValeurs((v) => ({ ...v, [champ]: valeur }));

  async function ajouterFichiers(fichiers) {
    if (!fichiers.length) return;
    setTeleversement(true);
    setErreur('');
    try {
      const { medias } = await api.televerser(fichiers);
      setValeurs((v) => ({ ...v, medias: [...v.medias, ...medias] }));
    } catch (e) {
      setErreur(e.message);
    } finally {
      setTeleversement(false);
      if (fichierRef.current) fichierRef.current.value = '';
    }
  }

  function retirerMedia(index) {
    setValeurs((v) => ({ ...v, medias: v.medias.filter((_, i) => i !== index) }));
  }

  async function enregistrer(e) {
    e.preventDefault();
    setErreur('');

    if (!valeurs.nom.trim()) return setErreur('Le nom est obligatoire');
    if (valeurs.prix === '' || Number(valeurs.prix) < 0) return setErreur('Prix invalide');

    setEnvoi(true);
    const data = {
      ...valeurs,
      prix: Number(valeurs.prix),
      promotion: Number(valeurs.promotion) || 0,
      stock: Number(valeurs.stock) || 0,
      categorie: valeurs.categorie || null,
    };

    try {
      if (edition) await api.modifierProduit(id, data);
      else await api.creerProduit(data);
      naviguer('/admin/produits');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return <div className="chargement">Chargement...</div>;

  const prixApres = prixFinal({
    prix: Number(valeurs.prix || 0),
    promotion: Number(valeurs.promotion || 0),
  });

  return (
    <>
      <div className="admin-entete">
        <h1>{edition ? 'Modifier le produit' : 'Ajouter un produit'}</h1>
      </div>

      {erreur && <div className="message message-erreur">{erreur}</div>}

      <form className="formulaire-admin" onSubmit={enregistrer}>
        <div className="bloc">
          <h3>Informations</h3>

          <div className="champ">
            <label htmlFor="nom">Nom du produit</label>
            <input
              id="nom"
              type="text"
              value={valeurs.nom}
              onChange={(e) => modifier('nom', e.target.value)}
            />
          </div>

          <div className="champ">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={valeurs.description}
              onChange={(e) => modifier('description', e.target.value)}
              placeholder="Matière, dimensions, couleurs disponibles..."
            />
          </div>

          <div className="champ">
            <label htmlFor="categorie">Catégorie</label>
            <select
              id="categorie"
              value={valeurs.categorie}
              onChange={(e) => modifier('categorie', e.target.value)}
            >
              <option value="">Sans catégorie</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bloc">
          <h3>Prix et stock</h3>

          <div className="grille-champs">
            <div className="champ">
              <label htmlFor="prix">Prix (TND)</label>
              <input
                id="prix"
                type="number"
                step="0.001"
                min="0"
                value={valeurs.prix}
                onChange={(e) => modifier('prix', e.target.value)}
              />
            </div>

            <div className="champ">
              <label htmlFor="promotion">Promotion (%)</label>
              <input
                id="promotion"
                type="number"
                min="0"
                max="100"
                value={valeurs.promotion}
                onChange={(e) => modifier('promotion', e.target.value)}
              />
              {Number(valeurs.promotion) > 0 && (
                <span className="aide">Prix après remise : {formaterPrix(prixApres)}</span>
              )}
            </div>

            <div className="champ">
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                type="number"
                min="0"
                value={valeurs.stock}
                onChange={(e) => modifier('stock', e.target.value)}
              />
            </div>
          </div>

          <div className="cases">
            <label className="case-a-cocher">
              <input
                type="checkbox"
                checked={valeurs.meilleureVente}
                onChange={(e) => modifier('meilleureVente', e.target.checked)}
              />
              Afficher dans les meilleures ventes
            </label>
            <label className="case-a-cocher">
              <input
                type="checkbox"
                checked={valeurs.actif}
                onChange={(e) => modifier('actif', e.target.checked)}
              />
              Visible sur la boutique
            </label>
          </div>
        </div>

        <div className="bloc">
          <h3>Photos et vidéos</h3>

          <div className="depot" onClick={() => fichierRef.current?.click()}>
            <strong>
              {televersement ? 'Envoi en cours...' : 'Cliquez pour choisir des fichiers'}
            </strong>
            <span>Images (JPG, PNG, WEBP) et vidéos (MP4, WEBM) — 50 Mo max par fichier</span>
          </div>

          <input
            ref={fichierRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={(e) => ajouterFichiers(Array.from(e.target.files || []))}
          />

          {valeurs.medias.length > 0 && (
            <div className="medias-grille">
              {valeurs.medias.map((m, i) => (
                <div className="media-item" key={m.url + i}>
                  {m.type === 'video' ? (
                    <video src={urlMedia(m.url)} muted preload="metadata" />
                  ) : (
                    <img src={urlMedia(m.url)} alt="" />
                  )}
                  <button
                    type="button"
                    className="media-retirer"
                    onClick={() => retirerMedia(i)}
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                  {i === 0 && <span className="media-principal">Principal</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="barre-actions">
          <button type="submit" className="btn" disabled={envoi || televersement}>
            {envoi
              ? 'Enregistrement...'
              : edition
                ? 'Enregistrer les modifications'
                : 'Ajouter le produit'}
          </button>
          <button
            type="button"
            className="btn btn-secondaire"
            onClick={() => naviguer('/admin/produits')}
          >
            Annuler
          </button>
        </div>
      </form>
    </>
  );
}
