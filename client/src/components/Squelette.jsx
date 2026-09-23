// Blocs de chargement : evite la page blanche pendant l'attente du serveur.
export default function Squelette({ lignes = 4, titre = true }) {
  return (
    <div>
      {titre && (
        <div className="squelette-entete">
          <div className="squelette squelette-titre" />
          <div className="squelette squelette-sous-titre" />
        </div>
      )}
      <div className="grille-produits">
        {Array.from({ length: lignes }).map((_, i) => (
          <div key={i} style={{ '--rang': i }}>
            <div className="squelette squelette-visuel" />
            <div className="squelette squelette-ligne" />
            <div className="squelette squelette-ligne courte" />
          </div>
        ))}
      </div>
    </div>
  );
}
