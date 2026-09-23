import { useCallback, useRef, useState } from 'react';

// Revele un bloc quand il entre dans l'ecran (une seule fois).
//
// On utilise une "ref callback" et non useRef + useEffect : le bloc observe
// n'apparait souvent qu'apres le chargement des donnees, donc un effet lance
// au montage ne trouverait encore aucun element a observer et le contenu
// resterait invisible.
export function useReveal() {
  const [visible, setVisible] = useState(false);
  const observateur = useRef(null);

  const ref = useCallback((element) => {
    // Nettoie l'observation precedente (element remplace ou demonte)
    if (observateur.current) {
      observateur.current.disconnect();
      observateur.current = null;
    }

    if (!element) return;

    // Navigateur sans IntersectionObserver : on affiche sans animation.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    // Deja a l'ecran au moment ou il apparait : on revele tout de suite,
    // sans attendre le premier rappel de l'observateur.
    const zone = element.getBoundingClientRect();
    const hauteur = window.innerHeight || document.documentElement.clientHeight;
    if (zone.top < hauteur && zone.bottom > 0) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          setVisible(true);
          obs.disconnect();
          observateur.current = null;
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    obs.observe(element);
    observateur.current = obs;
  }, []);

  return [ref, visible];
}
