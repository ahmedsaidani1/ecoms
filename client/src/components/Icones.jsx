// Icones minimalistes dessinees a la main (aucune bibliotheque)
const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function ChevronGauche(props) {
  return (
    <svg {...base} {...props}>
      <path d="M10 3 5 8l5 5" />
    </svg>
  );
}

export function ChevronDroite(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

export function ChevronBas(props) {
  return (
    <svg {...base} width="14" height="14" {...props}>
      <path d="M3 6l5 5 5-5" />
    </svg>
  );
}

export function Loupe(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

export function Menu(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M2 4h12M2 8h12M2 12h12" />
    </svg>
  );
}

export function Croix(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}
