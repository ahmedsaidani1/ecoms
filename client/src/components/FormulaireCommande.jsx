import { useState } from 'react';
import SelecteurGouvernorat from './SelecteurGouvernorat.jsx';
import { api, formaterPrix, prixFinal } from '../api.js';

const VIDE = { nomComplet: '', gouvernorat: '', telephone: '', quantite: 1 };

export default function FormulaireCommande({ produit }) {
  const [valeurs, setValeurs] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [erreurGenerale, setErreurGenerale] = useState('');
  const [confirmee, setConfirmee] = useState(null);

  const unitaire = prixFinal(produit);
  const total = unitaire * (Number(valeurs.quantite) || 0);
  const rupture = produit.stock === 0;

  function modifier(champ, valeur) {
    setValeurs((v) => ({ ...v, [champ]: valeur }));
    setErreurs((e) => ({ ...e, [champ]: undefined }));
  }

  function valider() {
    const e = {};
    if (valeurs.nomComplet.trim().length < 3) e.nomComplet = 'Entrez votre nom complet';
    if (!valeurs.gouvernorat) e.gouvernorat = 'Choisissez votre gouvernorat';
    if (!/^[0-9]{8}$/.test(valeurs.telephone)) e.telephone = 'Le numéro doit contenir 8 chiffres';
    const q = Number(valeurs.quantite);
    if (!Number.isInteger(q) || q < 1) e.quantite = 'Quantité invalide';
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  async function envoyer(event) {
    event.preventDefault();
    setErreurGenerale('');
    if (!valider()) return;

    setEnvoi(true);
    try {
      const reponse = await api.creerCommande({
        ...valeurs,
        quantite: Number(valeurs.quantite),
        produit: produit._id,
      });
      setConfirmee(reponse);
      setValeurs(VIDE);
    } catch (err) {
      setErreurGenerale(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  if (confirmee) {
    return (
      <div className="confirmation">
        <div className="confirmation-marque" aria-hidden="true">
          ✓
        </div>
        <h3>Merci, c’est noté !</h3>
        <p>Nous vous appellerons pour confirmer la livraison.</p>
        <p className="numero">Commande {confirmee.numero}</p>
        <p>Total à payer à la réception : {formaterPrix(confirmee.total)}</p>
        <button type="button" className="btn btn-secondaire" onClick={() => setConfirmee(null)}>
          Passer une autre commande
        </button>
      </div>
    );
  }

  return (
    <form className="bloc-commande" onSubmit={envoyer} noValidate>
      <div className="bloc-commande-entete">
        <h3>Commander ce produit</h3>
        <p>Aucun paiement en ligne : vous réglez à la livraison.</p>
      </div>

      <div className="bloc-commande-corps">
        {erreurGenerale && <div className="message message-erreur">{erreurGenerale}</div>}

        <div className="champ">
          <label htmlFor="nomComplet">Nom complet</label>
          <input
            id="nomComplet"
            type="text"
            value={valeurs.nomComplet}
            className={erreurs.nomComplet ? 'invalide' : ''}
            onChange={(e) => modifier('nomComplet', e.target.value)}
            placeholder="Prénom et nom"
          />
          {erreurs.nomComplet && <span className="erreur-champ">{erreurs.nomComplet}</span>}
        </div>

        <div className="champ">
          <label>Gouvernorat</label>
          <SelecteurGouvernorat
            valeur={valeurs.gouvernorat}
            onChange={(g) => modifier('gouvernorat', g)}
            invalide={Boolean(erreurs.gouvernorat)}
          />
          {erreurs.gouvernorat && <span className="erreur-champ">{erreurs.gouvernorat}</span>}
        </div>

        <div className="champ">
          <label htmlFor="telephone">Numéro de téléphone</label>
          <input
            id="telephone"
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={valeurs.telephone}
            className={erreurs.telephone ? 'invalide' : ''}
            onChange={(e) => modifier('telephone', e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="8 chiffres"
          />
          {erreurs.telephone ? (
            <span className="erreur-champ">{erreurs.telephone}</span>
          ) : (
            <span className="aide">Exemple : 20123456</span>
          )}
        </div>

        <div className="champ">
          <label htmlFor="quantite">Quantité</label>
          <div className="quantite">
            <button
              type="button"
              onClick={() => modifier('quantite', Math.max(1, Number(valeurs.quantite) - 1))}
              disabled={Number(valeurs.quantite) <= 1}
              aria-label="Diminuer"
            >
              −
            </button>
            <input
              id="quantite"
              type="text"
              inputMode="numeric"
              value={valeurs.quantite}
              onChange={(e) => modifier('quantite', e.target.value.replace(/\D/g, '').slice(0, 3))}
            />
            <button
              type="button"
              onClick={() => modifier('quantite', Number(valeurs.quantite || 0) + 1)}
              aria-label="Augmenter"
            >
              +
            </button>
          </div>
          {erreurs.quantite && <span className="erreur-champ">{erreurs.quantite}</span>}
        </div>

        <div className="total-ligne">
          <span>Total</span>
          <span>{formaterPrix(total)}</span>
        </div>

        <button type="submit" className="btn btn-bloc btn-safran" disabled={envoi || rupture}>
          {rupture ? 'Épuisé pour le moment' : envoi ? 'Envoi en cours...' : 'Confirmer la commande'}
        </button>
      </div>
    </form>
  );
}
