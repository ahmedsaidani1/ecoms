import { Link } from 'react-router-dom';
import { ChevronDroite } from './Icones.jsx';
import { formaterPrix, prixFinal, urlMedia } from '../api.js';

function Media({ media, nom, className }) {
  if (media.type === 'video') {
    return <video className={className} src={urlMedia(media.url)} muted playsInline preload="metadata" />;
  }
  return <img className={className} src={urlMedia(media.url)} alt={nom} loading="lazy" />;
}

export default function ProductCard({ produit }) {
  const [premiere, seconde] = produit.medias || [];
  const enPromo = produit.promotion > 0;
  const rupture = produit.stock === 0;

  return (
    <Link to={`/produit/${produit.slug}`} className="carte">
      <div className="carte-visuel">
        {premiere ? (
          <>
            <Media media={premiere} nom={produit.nom} className="carte-image" />
            {/* Une deuxieme photo prend le relais au survol */}
            {seconde && seconde.type === 'image' && (
              <Media media={seconde} nom="" className="carte-image carte-image-2" />
            )}
          </>
        ) : (
          <div className="sans-image">
            <img src="/logo-icone.png" alt="" />
          </div>
        )}

        {enPromo && <span className="etiquette">-{produit.promotion}%</span>}
        {produit.meilleureVente && <span className="pastille">Coup de cœur</span>}
        {rupture && <span className="carte-rupture">Épuisé</span>}

        {!rupture && (
          <span className="carte-voir" aria-hidden="true">
            <ChevronDroite />
          </span>
        )}
      </div>

      <div className="carte-corps">
        {produit.categorie?.nom && <span className="carte-categorie">{produit.categorie.nom}</span>}
        <span className="carte-nom">{produit.nom}</span>
        <div className="prix-ligne">
          <span className="prix">{formaterPrix(prixFinal(produit))}</span>
          {enPromo && <span className="prix-barre">{formaterPrix(produit.prix)}</span>}
        </div>
      </div>
    </Link>
  );
}
