import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Carousel from '../components/Carousel.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Squelette from '../components/Squelette.jsx';
import { ChevronDroite } from '../components/Icones.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { api, formaterPrix, prixFinal, urlMedia } from '../api.js';

const ANNONCES = [
  'Livraison dans les 24 gouvernorats',
  'Paiement à la livraison',
  'Commande en moins d’une minute',
  'Confirmation par appel',
];

const ETAPES = [
  { titre: 'Trouvez', texte: 'Parcourez les rayons et choisissez le produit qui vous plaît.' },
  { titre: 'Commandez', texte: 'Nom, gouvernorat, téléphone : trois champs, et c’est envoyé.' },
  { titre: 'Payez à la réception', texte: 'Nous vous appelons pour confirmer, vous réglez à la livraison.' },
];

// Pastille ronde dont le texte tourne lentement
function Sticker() {
  return (
    <div className="sticker" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <path id="cercle-sticker" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <text>
          <textPath href="#cercle-sticker" textLength="280">
            PAIEMENT À LA LIVRAISON • 24 GOUVERNORATS •
          </textPath>
        </text>
      </svg>
      <img src="/logo-icone.png" alt="" />
    </div>
  );
}

// Choisit jusqu'a 3 photos pour le collage : un produit different par photo
// d'abord, puis les photos supplementaires si le catalogue est encore petit.
function photosDeVitrine(produits) {
  const avecImage = produits.filter((p) => p.medias?.some((m) => m.type === 'image'));
  const ordonnes = [
    ...avecImage.filter((p) => p.meilleureVente),
    ...avecImage.filter((p) => !p.meilleureVente && p.promotion > 0),
    ...avecImage.filter((p) => !p.meilleureVente && !(p.promotion > 0)),
  ];

  const choix = ordonnes.slice(0, 3).map((p) => ({
    produit: p,
    url: p.medias.find((m) => m.type === 'image').url,
  }));

  for (const p of ordonnes) {
    if (choix.length >= 3) break;
    for (const m of p.medias.filter((m) => m.type === 'image').slice(1)) {
      if (choix.length >= 3) break;
      choix.push({ produit: p, url: m.url });
    }
  }
  return choix;
}

export default function Accueil() {
  const { categories } = useOutletContext();
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);

  const [refVentes, ventesVisible] = useReveal();
  const [refRayons, rayonsVisible] = useReveal();
  const [refPromos, promosVisible] = useReveal();
  const [refEtapes, etapesVisible] = useReveal();

  useEffect(() => {
    api
      .produits()
      .then(setProduits)
      .catch(() => setProduits([]))
      .finally(() => setChargement(false));
  }, []);

  const meilleuresVentes = produits.filter((p) => p.meilleureVente);
  const promos = produits.filter((p) => p.promotion > 0);
  const vitrine = useMemo(() => photosDeVitrine(produits), [produits]);

  // Nombre de produits et une photo representative par rayon
  const rayons = useMemo(
    () =>
      categories.map((c) => {
        const duRayon = produits.filter((p) => p.categorie?._id === c._id);
        const photo = duRayon
          .flatMap((p) => p.medias || [])
          .find((m) => m.type === 'image');
        return { ...c, nombre: duRayon.length, photo: photo?.url };
      }),
    [categories, produits]
  );

  return (
    <>
      <section className="heros">
        <div className="conteneur heros-grille">
          <div className="heros-texte">
            <span className="pastille-marque">
              <i>Tunisie</i>
              Votre bazar général en ligne
            </span>
            <h1>
              Tout ce qu’il vous faut, <span className="accent">au même endroit.</span>
            </h1>
            <p>
              Maison, sport, tech et petits plaisirs du quotidien, choisis avec soin. Livrés dans
              les 24 gouvernorats, payés à la réception.
            </p>
            <div className="heros-actions">
              <Link to="/produits" className="btn">
                Découvrir la boutique
                <ChevronDroite className="decale" />
              </Link>
              <Link to="/produits?promo=true" className="lien-souligne">
                Voir les promotions
              </Link>
            </div>
            <ul className="heros-faits">
              <li>
                <strong>24</strong>
                <span>gouvernorats livrés</span>
              </li>
             
              <li>
                <strong>1 min</strong>
                <span>pour commander</span>
              </li>
            </ul>
          </div>

          <div className="heros-collage">
            {vitrine.length > 0 ? (
              vitrine.map(({ produit, url }, i) => (
                <Link
                  key={url}
                  to={`/produit/${produit.slug}`}
                  className={`photo photo-${i + 1}`}
                >
                  <img src={urlMedia(url)} alt={produit.nom} />
                  {/* Une seule legende par produit, meme s'il occupe plusieurs cadres */}
                  {vitrine.findIndex((v) => v.produit._id === produit._id) === i && (
                    <span className="photo-legende">
                      <span>{produit.nom}</span>
                      <strong>{formaterPrix(prixFinal(produit))}</strong>
                    </span>
                  )}
                </Link>
              ))
            ) : (
              !chargement && (
                <div className="collage-vide">
                  <img src="/logo.png" alt="" />
                </div>
              )
            )}
            <Sticker />
          </div>
        </div>
      </section>

      <div className="bandeau">
        <div className="bandeau-piste">
          {[0, 1].map((copie) => (
            <div className="bandeau-groupe" key={copie} aria-hidden={copie === 1}>
              {ANNONCES.map((texte) => (
                <span className="bandeau-element" key={texte}>
                  {texte}
                  <i className="carre" aria-hidden="true" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {chargement && (
        <section className="section">
          <div className="conteneur">
            <Squelette lignes={4} />
          </div>
        </section>
      )}

      {meilleuresVentes.length > 0 && (
        <section className={`section reveal ${ventesVisible ? 'apparu' : ''}`} ref={refVentes}>
          <div className="conteneur">
            <Carousel
              surtitre="Sélection"
              titre={
                <>
                  Nos <span className="accent">coups de cœur</span>
                </>
              }
              sousTitre="Les produits que nos clients commandent le plus."
              lien={
                <Link to="/produits" className="lien-souligne">
                  Tout voir
                </Link>
              }
              enfants={meilleuresVentes.map((p) => <ProductCard key={p._id} produit={p} />)}
            />
          </div>
        </section>
      )}

      {rayons.length > 0 && (
        <section
          className={`section section-alt reveal ${rayonsVisible ? 'apparu' : ''}`}
          ref={refRayons}
        >
          <div className="conteneur">
            <div className="section-entete">
              <div>
                <span className="surtitre">Les rayons</span>
                <h2>
                  Trouvez votre <span className="accent">bonheur</span>
                </h2>
              </div>
              <Link to="/produits" className="lien-souligne">
                Tous les produits
              </Link>
            </div>

            <div className="rayons cascade">
              {rayons.map((r, i) => (
                <Link
                  key={r._id}
                  to={`/produits?categorie=${r.slug}`}
                  className={`rayon teinte-${i % 5}`}
                >
                  <span className="rayon-nom">{r.nom}</span>
                  <span className="rayon-compte">
                    {r.nombre} produit{r.nombre > 1 ? 's' : ''}
                  </span>
                  {r.photo && <img className="rayon-image" src={urlMedia(r.photo)} alt="" loading="lazy" />}
                  <span className="rayon-fleche" aria-hidden="true">
                    <ChevronDroite />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {promos.length > 0 && (
        <section
          className={`section section-promo reveal ${promosVisible ? 'apparu' : ''}`}
          ref={refPromos}
        >
          <div className="conteneur">
            <Carousel
              surtitre="Bonnes affaires"
              titre="Les promos du moment"
              sousTitre="Des remises en cours sur une sélection de produits."
              lien={
                <Link to="/produits?promo=true" className="lien-souligne">
                  Toutes les promos
                </Link>
              }
              enfants={promos.map((p) => <ProductCard key={p._id} produit={p} />)}
            />
          </div>
        </section>
      )}

      <section className={`section reveal ${etapesVisible ? 'apparu' : ''}`} ref={refEtapes}>
        <div className="conteneur">
          <div className="section-entete">
            <div>
              <span className="surtitre">Simple comme bonjour</span>
              <h2>
                Commander en <span className="accent">trois temps</span>
              </h2>
            </div>
          </div>

          <ol className="etapes cascade">
            {ETAPES.map((e, i) => (
              <li className="etape" key={e.titre}>
                <span className="etape-numero">0{i + 1}</span>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {!chargement && produits.length === 0 && (
        <div className="conteneur">
          <div className="vide">
            <h3>La boutique se prépare</h3>
            <p>Ajoutez vos premiers produits depuis le tableau de bord.</p>
          </div>
        </div>
      )}
    </>
  );
}
