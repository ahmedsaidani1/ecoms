import { useEffect, useMemo, useRef, useState } from 'react';
import { GOUVERNORATS } from '../data/gouvernorats.js';

// Normalise pour que "beja" trouve "Béja"
const sansAccent = (t) =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function SelecteurGouvernorat({ valeur, onChange, invalide }) {
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [survol, setSurvol] = useState(0);
  const cadre = useRef(null);

  const resultats = useMemo(() => {
    const q = sansAccent(recherche);
    if (!q) return GOUVERNORATS;
    return GOUVERNORATS.filter((g) => sansAccent(g).includes(q));
  }, [recherche]);

  useEffect(() => {
    function clicExterieur(e) {
      if (cadre.current && !cadre.current.contains(e.target)) fermer();
    }
    document.addEventListener('mousedown', clicExterieur);
    return () => document.removeEventListener('mousedown', clicExterieur);
  });

  function fermer() {
    setOuvert(false);
    setRecherche('');
    setSurvol(0);
  }

  function choisir(g) {
    onChange(g);
    fermer();
  }

  function auClavier(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOuvert(true);
      setSurvol((i) => Math.min(i + 1, resultats.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSurvol((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (ouvert && resultats[survol]) choisir(resultats[survol]);
      else setOuvert(true);
    } else if (e.key === 'Escape') {
      fermer();
    }
  }

  return (
    <div className="selecteur" ref={cadre}>
      <input
        type="text"
        value={ouvert ? recherche : valeur}
        placeholder="Rechercher un gouvernorat"
        className={invalide ? 'invalide' : ''}
        onChange={(e) => {
          setRecherche(e.target.value);
          setSurvol(0);
          setOuvert(true);
        }}
        onFocus={() => setOuvert(true)}
        onKeyDown={auClavier}
        autoComplete="off"
        role="combobox"
        aria-expanded={ouvert}
      />

      {ouvert && (
        <div className="selecteur-liste">
          {resultats.map((g, i) => (
            <button
              type="button"
              key={g}
              className={`selecteur-option ${i === survol ? 'survol' : ''} ${
                g === valeur ? 'choisi' : ''
              }`}
              onMouseEnter={() => setSurvol(i)}
              onClick={() => choisir(g)}
            >
              {g}
            </button>
          ))}
          {resultats.length === 0 && <div className="selecteur-vide">Aucun résultat</div>}
        </div>
      )}
    </div>
  );
}
