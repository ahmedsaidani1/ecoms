import { useState } from 'react';
import { api, setToken } from '../../api.js';

export default function Connexion({ onConnexion }) {
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function envoyer(e) {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      const { token } = await api.login(motDePasse);
      setToken(token);
      onConnexion();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="connexion">
      <form className="connexion-carte" onSubmit={envoyer}>
        <h2>Tableau de bord</h2>
        <p>Espace réservé à l'administration de la boutique.</p>

        {erreur && <div className="message message-erreur">{erreur}</div>}

        <div className="champ">
          <label htmlFor="mdp">Mot de passe</label>
          <input
            id="mdp"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoFocus
          />
        </div>

        <button type="submit" className="btn btn-bloc" disabled={envoi || !motDePasse}>
          {envoi ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
