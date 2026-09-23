import { useEffect, useRef, useState } from 'react';
import { ChevronGauche, ChevronDroite } from './Icones.jsx';

export default function Carousel({ surtitre, titre, sousTitre, lien, enfants }) {
  const piste = useRef(null);
  const [debut, setDebut] = useState(true);
  const [fin, setFin] = useState(false);

  function majFleches() {
    const el = piste.current;
    if (!el) return;
    setDebut(el.scrollLeft <= 4);
    setFin(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }

  useEffect(() => {
    majFleches();
    const el = piste.current;
    if (!el) return;
    el.addEventListener('scroll', majFleches, { passive: true });
    window.addEventListener('resize', majFleches);
    return () => {
      el.removeEventListener('scroll', majFleches);
      window.removeEventListener('resize', majFleches);
    };
  }, [enfants.length]);

  function defiler(direction) {
    const el = piste.current;
    if (!el) return;
    const pas = el.querySelector('.carrousel-element')?.offsetWidth || 260;
    el.scrollBy({ left: direction * (pas + 24), behavior: 'smooth' });
  }

  return (
    <div className="carrousel">
      <div className="section-entete">
        <div>
          {surtitre && <span className="surtitre">{surtitre}</span>}
          <h2>{titre}</h2>
          {sousTitre && <p>{sousTitre}</p>}
        </div>
        <div className="carrousel-fleches">
          {lien}
          <button
            type="button"
            className="fleche"
            onClick={() => defiler(-1)}
            disabled={debut}
            aria-label="Précédent"
          >
            <ChevronGauche />
          </button>
          <button
            type="button"
            className="fleche"
            onClick={() => defiler(1)}
            disabled={fin}
            aria-label="Suivant"
          >
            <ChevronDroite />
          </button>
        </div>
      </div>

      <div className="carrousel-piste cascade" ref={piste}>
        {enfants.map((enfant, i) => (
          <div className="carrousel-element" key={i}>
            {enfant}
          </div>
        ))}
      </div>
    </div>
  );
}
