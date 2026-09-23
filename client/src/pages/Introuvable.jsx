import { Link } from 'react-router-dom';

export default function Introuvable() {
  return (
    <div className="conteneur">
      <div className="vide">
        <h3>Page introuvable</h3>
        <p>La page que vous cherchez n'existe pas.</p>
        <Link to="/" className="btn btn-secondaire" style={{ marginTop: 16 }}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
