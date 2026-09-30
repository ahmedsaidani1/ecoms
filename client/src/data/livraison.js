// Frais de livraison : 7 TND, offerts a partir de 100 TND d'achat.
// Doit rester identique a server/src/utils/livraison.js (le serveur fait foi).
export const LIVRAISON = { frais: 7, seuilGratuit: 100 };

export function fraisLivraison(sousTotal) {
  return sousTotal >= LIVRAISON.seuilGratuit ? 0 : LIVRAISON.frais;
}
